import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { months } from "../utils/time";
import { queryDune } from "../utils/dune";

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

async function queryConversions(): Promise<CliffAdapterResult[]> {
    const result: CliffAdapterResult[] = [];
    const issuanceData = await queryDune("6757650", true)

    for (let i = 0; i < issuanceData.length; i++) {
        result.push({
            type: "cliff",
            start: issuanceData[i].date,
            amount: Number(issuanceData[i].amount) / 1e18
        });
    }
    return result;
}

const rhea: Protocol = {
    "REF/BRRR Conversion": queryConversions,
    "Token Operation Treasury": manualCliff(start, shares.treasury),
    "Liquidity Provision": manualCliff(start, shares.liquidity),
    "Airdrop": manualCliff(start, total * 0.04),
    "Marketing": [manualCliff(start, shares.marketing / 2), manualCliff(months(start, 3), shares.marketing / 4), manualCliff(months(start, 6), shares.marketing / 4)],
    "Incentives": manualLinear(months(start, 3),months(start, 39), total * 0.266),
    "Team & Advisors": manualLinear(months(start, 6), months(start, 36), shares.team),
    meta: {
        notes: [
            "The REF/BRRR Conversion has a 37% allocation and the current unlocks are calculated from the outflows of this address: rhea-conversion.sputnik-dao.near"
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
        airdrop: ["Airdrop", "REF/BRRR Conversion"],
        farming: ["Incentives"],
        insiders: ["Team & Advisors", "Marketing"],
        noncirculating: ["Token Operation Treasury"],
    },
};
export default rhea;