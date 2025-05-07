import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const start = 1745452800;
const totalSupply = 1_000_000_000;

const liquidityMiningAllocation = totalSupply * 0.20;
const polAllocation = totalSupply * 0.02;
const boycoIncentivesAllocation = totalSupply * 0.03;
const futurePartnerRewardsAllocation = totalSupply * 0.0575; // Held by DAO/Foundation
const airdropMineralsAllocation = totalSupply * 0.10;
const airdropRetroactiveAllocation = totalSupply * 0.09;
const airdropContributorsAllocation = totalSupply * 0.01;
const coreTeamAllocation = totalSupply * 0.2020;
const foundationAllocation = totalSupply * 0.0965;
const investorsShortVestAllocation = totalSupply * 0.0129;
const investorsLongVestAllocation = totalSupply * 0.1491;
const serviceProvidersAllocation = totalSupply * 0.03;
const advisorsAllocation = totalSupply * 0.0020;

const dolomite: Protocol = {
    "Future Partner Rewards": manualCliff(
        start,
        futurePartnerRewardsAllocation
    ),
    "Airdrop - Retroactive Usage": manualCliff(start, airdropRetroactiveAllocation),
    "Foundation": manualCliff(start, foundationAllocation),
    "Service Providers": manualCliff(start, serviceProvidersAllocation),
    "Protocol-Owned Liquidity": manualCliff(start, polAllocation),
    "Airdrop - Early Contributors": manualCliff(start, airdropContributorsAllocation),

    "Liquidity Mining": manualLinear(
        start,
        start + periodToSeconds.years(4),
        liquidityMiningAllocation
    ),

    "Boyco Incentives": manualLinear(
        start,
        start + periodToSeconds.years(4),
        boycoIncentivesAllocation
    ),
    "Airdrop - Minerals Claimers Options": manualLinear(
        start,
        start + periodToSeconds.months(6),
        airdropMineralsAllocation
    ),

    "Core Team": manualLinear(
        start + periodToSeconds.year,
        start + periodToSeconds.years(4),
        coreTeamAllocation
    ),
    "Investors": [
        manualLinear(
            start,
            start + periodToSeconds.year,
            investorsShortVestAllocation
        ),
        manualLinear(
            start + periodToSeconds.year,
            start + periodToSeconds.years(4),
            investorsLongVestAllocation
        )
    ],
    "Advisors": manualLinear(
        start + periodToSeconds.year,
        start + periodToSeconds.years(4),
        advisorsAllocation
    ),

    meta: {
        notes: [
            "All allocations specified as veDOLO or oDOLO are modeled as standard DOLO.",
            "Liquidity Mining & Boyco Incentives is assumed to be unlocked lineary over 4 years.",
            "Future Partner Rewards have no defined schedule and assumed to be unlocked at start.",
            "Airdrop - Minerals Claimers represents tokens available via call options ($0.045 strike) exercisable for 6 months post-TGE. Modeled as linear release over 6 months reflecting the availability window; actual release depends on option exercise. Unclaimed tokens return to DAO Treasury after 6 months. This is not modeled",
            "Foundation has no specified vesting schedule. Modeled as unlocked at TGE and held/managed by the foundation.",
            "Service Providers have no specified vesting schedule. Modeled as unlocked at TGE.",
            "Advisors vesting described as '2-3 years with a 1-year cliff'. Assumed 1-year cliff followed by 3 years linear vesting.",
            "Inflation starting after Year 4 is not modeled.",
        ],
        sources: ["https://docs.dolomite.io/dolo/distribution"],
        token: "coingecko:dolomite",
        protocolIds: ["2187"]
    },
    categories: {
        farming: ["Liquidity Mining"],
        liquidity: ["Protocol-Owned Liquidity"],
        airdrop: [
            "Airdrop - Minerals Claimers Options",
            "Airdrop - Retroactive Usage",
            "Airdrop - Early Contributors"
        ],
        privateSale: ["Investors"],
        insiders: ["Core Team", "Service Providers", "Advisors"],
        noncirculating: ["Foundation", "Boyco Incentives", "Future Partner Rewards"],
    }
};

export default dolomite;