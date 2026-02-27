import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { months, periodToSeconds } from "../utils/time";
import { balance } from "../adapters/balance";

const start = 1758499200; // 2025-09-22
const total = 100_000_000;
const shares = {
    liquidity: total * 0.11,
    communityBuilders: total * 0.02,
    communityAirdrop: total * 0.30,
    investors: total * 0.15,
    coreContributors: total * 0.15,
    advisors: total * 0.03,
    ecosystemFoundation: total * 0.10,
    ecosystemPartnership: total * 0.02,
    ecosystemIncentives: total * 0.12,
};
const riverPointsConverters = ["0x66a828E8180caad4AfFd5E068EE502d6911786A5", "0xa83F8792f5C80148e2789267ab71cBbdDeB55E10"]
const token = "0xda7ad9dea9397cffddae2f8a052b82f1484252b3"

const river: Protocol = {
    "Liquidity": manualCliff(start, shares.liquidity),
    "Community Builders": [manualCliff(start, shares.communityBuilders * 0.2), manualLinear(months(start, 3), months(start, 12),shares.communityBuilders * 0.8)],
    "Community Airdrop": balance(riverPointsConverters, token, "bsc", "river", start),
    "Investors": [manualCliff(months(start, 4), shares.investors * 0.1), manualLinear(months(start, 10),months(start, 34),shares.investors * 0.9)],
    "Core Contributors": manualLinear(months(start, 12), months(start, 42),shares.coreContributors),
    "Advisors": manualLinear(months(start, 12), months(start, 42), shares.advisors),
    "Ecosystem Foundation": manualStep(start, periodToSeconds.months(6), 10, shares.ecosystemFoundation / 10),
    "Ecosystem Partnership": manualCliff(start, shares.ecosystemPartnership),
    "Ecosystem Incentives": manualLinear(start, months(start, 60), shares.ecosystemIncentives),
    meta: {
        notes: [
            "Community Airdrop uses a Dynamic Conversion Mechanism: River Points convert into Staked RIVER over a 180-day window with a continuously increasing conversion rate.",
            "The 30% allocation to the Community Airdrop is a maximum; unallocated tokens (due to early conversions at lower rates) remains as Community Reserve"
        ],
        token: "coingecko:river",
        sources: [
            "https://docs.river.inc/tokenomics/tokenomics",
            "https://docs.river.inc/tokenomics/airdrop"
        ],
        protocolIds: ["parent#river-inc"],
        total,
    },
    categories: {
        liquidity: ["Liquidity", "Ecosystem Partnership"],
        airdrop: ["Community Airdrop"],
        farming: ["Community Builders", "Ecosystem Incentives"],
        insiders: ["Core Contributors", "Advisors"],
        privateSale: ["Investors"],
        noncirculating: ["Ecosystem Foundation"],
    },
};
export default river;
