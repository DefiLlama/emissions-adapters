import { manualCliff, manualLinear } from "../adapters/manual";
import { ProtocolV2, SectionV2 } from "../types/adapters";
import { months } from "../utils/time";
import { queryDuneSQLCached } from "../utils/dune";

const start = 1753833600; // 2025-07-30
const total = 1_000_000_000;
const shares = {
    team: total * 0.118,
    conversion: total * 0.37,
    airdropIncentives: total * 0.306,
    liquidity: total * 0.086,
    marketing: total * 0.06,
    treasury: total * 0.06,
};

function queryConversions() {
    return queryDuneSQLCached(`
    SELECT to_unixtime(block_date) as date, SUM(delta_amount) / 1e18 as amount
    FROM near.ft_transfers
    WHERE block_date >= START
    AND involved_account_id = 'rhea-conversion.sputnik-dao.near'
    AND contract_account_id = 'token.rhealab.near'
    AND delta_amount > 0
    GROUP BY block_date
    ORDER BY block_date ASC
    `, start, { protocolSlug: "rhea-finance", allocation: "REF/BRRR Conversion"});
}

function queryAirdrops() {
    return queryDuneSQLCached(`
    with incentives as (
        select block_date, delta_amount
        from near.ft_transfers
        where block_date >= START
        and involved_account_id in ('airdrop.rhealab.near', 'ref-airdrop.near')
        and affected_account_id not in ('rheachef.near', 'rhea-airdrop.sputnik-dao.near', 'ref-dev-teller.near')
        and contract_account_id = 'token.rhealab.near'
        and delta_amount > 0
    )
    , airdrops as (
        select
            to_unixtime(block_date) as date,
            SUM(delta_amount) / 1e18 as amount
        from incentives
        group by
            block_date
        order by
            block_date desc
    )
    select
        *
    from airdrops
    order by 1 desc
`, start, { protocolSlug: "rhea-finance", allocation: "Airdrops"});
}

function queryOrheaConversions() {
    return queryDuneSQLCached(`
    with orhea_conversion as (
        select block_date, delta_amount
        from near.ft_transfers
        where block_date >= START
        and involved_account_id in ('orhea-conv.rhealab.near')
        and affected_account_id not in ('rheachef.near', 'rhea-airdrop.sputnik-dao.near', 'ref-dev-teller.near')
        and contract_account_id = 'token.rhealab.near'
        and delta_amount > 0
    ), orhea_to_rhea as (
        select
            to_unixtime(block_date) as date,
            SUM(delta_amount) / 1e18 as amount
        from orhea_conversion
        group by
            block_date
        order by
            block_date desc
    )
    select
        *
    from orhea_to_rhea
    order by 1 desc
`, 1770681600,  { protocolSlug: "rhea-finance", allocation: "Incentives"});
}

const airdropSection: SectionV2 = {
    displayName: "Airdrops",
    methodology: "RHEA token airdrops distributed on NEAR via airdrop.rhealab.near and ref-airdrop.near, tracked on-chain via Dune",
    components: [
        {
            id: "airdrops",
            name: "Airdrops",
            methodology: "Tracks RHEA token transfers from airdrop accounts (airdrop.rhealab.near, ref-airdrop.near)",
            fetch: queryAirdrops,
        },
    ],
};

const incentivesSection: SectionV2 = {
    displayName: "Incentives",
    methodology: "oRHEA to RHEA conversions tracked on-chain via Dune. oRHEA is a reputation-weighted incentive token earned through ecosystem participation, convertible to RHEA.",
    isIncentive: true,
    components: [
        {
            id: "orhea-conversions",
            name: "Incentives",
            methodology: "Tracks RHEA outflows from orhea-conv.rhealab.near, representing oRHEA-to-RHEA conversions by ecosystem participants",
            isIncentive: true,
            fetch: queryOrheaConversions,
        },
    ],
};

const conversionSection: SectionV2 = {
    displayName: "REF/BRRR Conversion",
    methodology: "Tracks RHEA token outflows from rhea-conversion.sputnik-dao.near, representing REF and BRRR token conversions to RHEA",
    components: [
        {
            id: "ref-brrr-conversion",
            name: "REF/BRRR Conversion",
            methodology: "Tracks daily RHEA distributions from the conversion contract",
            fetch: queryConversions,
        },
    ],
};

const remainingConversionSection: SectionV2 = {
    displayName: "Remaining REF/BRRR Conversion",
    methodology: "Untracked portion of the 37% REF/BRRR Conversion allocation",
    isTBD: true,
    components: [
        {
            id: "remaining-conversion",
            name: "Remaining Conversion",
            methodology: "37% total allocation minus on-chain tracked conversions",
            isTBD: true,
            fetch: async () => {
                const conversionData = await queryConversions();
                const totalConverted = conversionData.reduce((sum: number, d: any) => sum + d.amount, 0);
                const remaining = shares.conversion - totalConverted;
                if (remaining <= 0) return [];
                return [manualCliff(start, remaining)];
            },
        },
    ],
};

const remainingAirdropIncentivesSection: SectionV2 = {
    displayName: "Remaining Airdrop & Incentives",
    methodology: "Untracked portion of the 30.6% Airdrop and Incentives allocation",
    isTBD: true,
    components: [
        {
            id: "remaining-allocation",
            name: "Remaining Allocation",
            methodology: "30.6% total allocation minus on-chain tracked airdrops and oRHEA conversions",
            isTBD: true,
            fetch: async () => {
                const [airdropData, orheaData] = await Promise.all([queryAirdrops(), queryOrheaConversions()]);
                const totalDistributed = [...airdropData, ...orheaData].reduce((sum, d) => sum + d.amount, 0);
                const remaining = shares.airdropIncentives - totalDistributed;
                if (remaining <= 0) return [];
                return [manualCliff(start, remaining)];
            },
        },
    ],
};

const rhea: ProtocolV2 = {
    "REF/BRRR Conversion": conversionSection,
    "Remaining REF/BRRR Conversion": remainingConversionSection,
    "Token Operation Treasury": manualCliff(start, shares.treasury),
    "Liquidity Provision": manualCliff(start, shares.liquidity),
    "Airdrops": airdropSection,
    "Incentives": incentivesSection,
    "Remaining Airdrop & Incentives": remainingAirdropIncentivesSection,
    "Marketing": [manualCliff(start, shares.marketing / 2), manualCliff(months(start, 3), shares.marketing / 4), manualCliff(months(start, 6), shares.marketing / 4)],
    "Team & Advisors": manualLinear(months(start, 6), months(start, 36), shares.team),
    meta: {
        version: 2,
        notes: [
            "REF/BRRR Conversion (37%) is tracked on-chain via Dune from rhea-conversion.sputnik-dao.near. The remaining untracked portion is marked as TBD.",
            "Airdrop and Incentives (30.6%) are tracked on-chain via Dune. The remaining untracked portion is projected as linear vesting through month 39.",
        ],
        token: "coingecko:rhea-2",
        sources: [
            "https://guide.rhea.finance/docs/tokenomics",
            "https://2480407424-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhIB0bSr6nOBfTiANqT-2910905616%2Fuploads%2FDDGbWfLSHG16ss0xh38F%2F05.09.2025_LXT_RHEA%20WP.pdf?alt=media&token=110c6390-0096-4c38-96d4-f6c92760ce72"
        ],
        protocolIds: ["parent#rhea-finance"],
        total,
    },
    categories: {
        liquidity: ["Liquidity Provision"],
        airdrop: ["Airdrop", "REF/BRRR Conversion", "Remaining REF/BRRR Conversion"],
        farming: ["Incentives", "Remaining Airdrop & Incentives"],
        insiders: ["Team & Advisors", "Marketing"],
        noncirculating: ["Token Operation Treasury"],
    },
};
export default rhea;