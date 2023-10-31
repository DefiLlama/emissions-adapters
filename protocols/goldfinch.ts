import { Protocol } from "../types/adapters";
import { manualStep, manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 114_342_856;
const start = 1641945600;

const goldfinch: Protocol = {
    "Community Treasury": manualStep(start - periodToSeconds.year, periodToSeconds.day, 1, 16_914_286),
    "Contributors": manualLinear(start, start + periodToSeconds.year, 742_857),    
    "Senior Pool Liquidity Mining": manualStep(start, periodToSeconds.day, 1, 9_142_857),
    "Auditors": manualStep(start, periodToSeconds.day, 1, 3_428_571),
    "Borrowers": manualStep(start, periodToSeconds.day, 1, 3_428_571),
    "Backer Staking": manualStep(start, periodToSeconds.day, 1, 3_428_571),
    "Backer Pool Liquidity Mining": manualStep(start, periodToSeconds.day, 1, 2_285_714),
    "Retroactive Liquidity Provider Distribution": manualLinear(start, start + periodToSeconds.month * 6, 4_571_429),
    "Flight Academy": manualLinear(start, start + periodToSeconds.year, 3_428_571),
    "Early Liquidity Provider Program": manualLinear(start, start + periodToSeconds.month * 6, 4_800_000),
    "Early and Future Team": [
        manualCliff(start, 0),
        manualLinear(start + periodToSeconds.year, start + periodToSeconds.year * 4, 32_457_143)
    ],
    "Investors": [
        manualCliff(start + periodToSeconds.year, 0),
        manualLinear(start + periodToSeconds.year, start + periodToSeconds.year * 3, 24_685_714)
    ],
    "Warbler Labs": [
        manualCliff(start + periodToSeconds.year, 0),
        manualLinear(start + periodToSeconds.year, start + periodToSeconds.year * 3, 5_028_572)
    ],

    meta: {
        notes: [
            "The emission and distribution details are based on the proposed and intended token emission and distribution for Goldfinch.",
            "The exact details might vary based on real-time decisions and governance.",
        ],
        sources: ["https://docs.goldfinch.finance/goldfinch/tokenomics"],
        token: "ethereum:0xdab396ccf3d84cf2d07c4454e10c8a6f5b008d2b", 
        protocolIds: ["703"], 
    },
    categories: {
        insiders: ["Early and Future Team", "Investors", "Warbler Labs", "Contributors"],
        farming: ["Early Liquidity Provider Program", "Retroactive Liquidity Provider Distribution", "Flight Academy", "Senior Pool Liquidity Mining", "Backer Staking", "Backer Pool Liquidity Mining"],
        noncirculating: ["Community Treasury", "Auditors", "Borrowers"],
    },
};

export default goldfinch;