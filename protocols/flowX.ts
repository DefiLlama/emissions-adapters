import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1701302400; // 2023-11-30
const total = 10_000_000
const month = (n: number) => Math.round((start + periodToSeconds.months(n)) / 86400) * 86400;

const shares = {
    genesisX: total * 0.045,
    airdrop: total * 0.002,
    presale: total * 0.08,
    publicSale: total * 0.11,
    liquidity: total * 0.033,
    cexs: total * 0.0802,
    incentives: total * 0.279,
    contributors: total * 0.108,
    partnership: total * 0.1404,
    treasury: total * 0.1224,
}

const flowX: Protocol = {
    "Genesis X Farming": manualLinear(start, start + periodToSeconds.weeks(12), shares.genesisX),
    "Airdrop": manualCliff(start + periodToSeconds.week, shares.airdrop),
    "Presale": manualCliff(start, shares.presale),
    "Public Sale": manualCliff(start, shares.publicSale),
    "Initial Liquidity": manualCliff(start, shares.liquidity),
    "CEX Listing": manualCliff(start, shares.cexs),
    "Incentive Rewards": manualStep(start + periodToSeconds.month, periodToSeconds.month, 36, shares.incentives / 36),
    "Core Contributors": manualLinear(month(6), month(36), shares.contributors),
    "Partnership": manualLinear(month(6), month(36), shares.partnership),
    "DAO Treasury": manualLinear(month(3), month(39), shares.treasury),

    meta: {
        notes: [
            "GenesisX, Presale, Public Sale, Incentives, and Contributors were partially unlocked in xFLX",
            "CEX Listing allocation is minted via DAO governance votes, not on a fixed schedule"
        ],
        token: "coingecko:flowx-finance",
        sources: [
            "https://docs.flowx.finance/tokenomics/flx-token"
        ],
        protocolIds: ["parent#flowx-finance"],
        total
    },
    categories: {
        publicSale: ["Presale", "Public Sale"],
        insiders: ["Core Contributors", "Partnership"],
        liquidity: ["Initial Liquidity"],
        airdrop: ["Airdrop"],
        farming: ["Genesis X Farming", "Incentive Rewards"],
        noncirculating: ["DAO Treasury", "CEX Listing"]
    },
};
export default flowX;

