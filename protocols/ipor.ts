import { Protocol } from "../types/adapters";
import { manualStep, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 100e6;  // 100 million
const TGE = 1669766400;  // Timestamp for 30th of November 2022

const ipor: Protocol = {
    "DAO Treasury": manualStep(TGE, periodToSeconds.day, 1, 30e6),
    "Operations": manualStep(TGE, periodToSeconds.day, 1, 12.7598e6),
    "Liquidity Mining": manualLinear(TGE, TGE + periodToSeconds.year * 5, 25e6),
    "Core Team": manualLinear(TGE + periodToSeconds.day, TGE + periodToSeconds.day + periodToSeconds.year * 3, 20e6),
    "Investors": manualLinear(TGE + periodToSeconds.day, TGE + periodToSeconds.day + periodToSeconds.year * 3, 11.85e6),
    "airdrop": [
        manualStep(TGE + periodToSeconds.year + 17 * periodToSeconds.day, periodToSeconds.day, 1, 85200),
        manualLinear(TGE + periodToSeconds.year + 17 * periodToSeconds.day, TGE + periodToSeconds.year + 17 * periodToSeconds.day + periodToSeconds.month * 6, 305000),
    ],
    meta: {
        notes: [
            "The emission and distribution details are based on the proposed and intended token emission and distribution for IPOR.",
            "The exact details might vary based on real-time decisions and governance.",
        ],
        sources: ["https://docs.ipor.io/tokenomics/token-distribution-model"], 
        token: "ethereum:0x1e4746dc744503b53b4a082cb3607b169a289090",
        protocolIds: ["2147"], 
    },
    categories: {
        insiders: ["Core Team", "Investors", "Operations"],
        farming: ["Liquidity Mining"],
        noncirculating: ["DAO Treasury"],
        airdrop: ["airdrop"]
    },
};

export default ipor;