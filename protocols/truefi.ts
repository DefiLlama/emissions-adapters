import { Protocol } from "../types/adapters";
import { manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 1_450_000_000;
const start = 1605926400; // 21st November 2020

const truefi: Protocol = {
    "Liquidity Mining Rewards": manualStep(start, periodToSeconds.day, 1, 565500000), 
    "Presale Investors": manualStep(start, periodToSeconds.month * 3, 8, 387917402 / 8),
    "Team": manualStep(start, periodToSeconds.month * 3, 8, 268250000 / 8),
    "Company": manualStep(start, periodToSeconds.year, 3, 163082598 / 3),    
    "Future Team": manualStep(start, periodToSeconds.day, 1, 65250000), 

    meta: {
        notes: [
            `The emission and distribution details are based on the proposed and intended token emission and distribution for TRU tokens`,
            `The exact details might vary based on real-time decisions and governance.`,
        ],
        sources: ["https://docs.truefi.io/faq/truefi-protocol/tru-token"],
        token: "ethereum:0x4c19596f5aaff459fa38b0f7ed92f11ae6543784",
        protocolIds: ["166"],
    },
    categories: {
        insiders: ["Presale Investors","Team","Company","Future Team"],
        farming: ["Liquidity Mining Rewards"],
    },
};

export default truefi;