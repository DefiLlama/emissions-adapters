import { Protocol } from "../types/adapters";
import { manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 100000000; 
const start = 1612137600; 

const dfx: Protocol = {    
    
    
    
    "Future Token Sale": manualLinear(start, start + periodToSeconds.month * 36, totalSupply * 0.05),    
    "Dev Fund": manualLinear(start, start + periodToSeconds.month * 36, totalSupply * 0.05),
    "Founders (4 founders)": manualLinear(start, start + periodToSeconds.month * 36, totalSupply * 0.15),
    "Seed (11 investors)": manualLinear(start, start + periodToSeconds.month * 36, totalSupply * 0.108),
    "Pre-Seed (9 investors)": manualLinear(start, start + periodToSeconds.month * 24, totalSupply * 0.092),
    "Treasury - Ecosystem DAO": manualLinear(start, start + periodToSeconds.month * 36, totalSupply * 0.20),
    "Liquidity Providers": [
        manualLinear(start, start + periodToSeconds.month * 32, totalSupply * 0.35 * 0.65),
        manualLinear(start + periodToSeconds.month * 32, start + periodToSeconds.month * 64, totalSupply * 0.35 * 0.25),
        manualLinear(start + periodToSeconds.month * 64, start + periodToSeconds.month * 96, totalSupply * 0.35 * 0.10)
    ],
    meta: {
        notes: [
            `The emission and distribution details are based on the proposed and intended token emission and distribution for DFX Protocol.`,
            `The exact details might vary based on real-time decisions and governance.`,
        ],
        sources: [
            "https://docs.dfx.finance/protocol/governance/dfx-token", 
        ],
        token: "ethereum:0x888888435fde8e7d4c54cab67f206e4199454c60",
        protocolIds: ["366"], 
    },
    categories: {
        farming: ["Liquidity Providers"],
        noncirculating: ["Treasury - Ecosystem DAO", "Dev Fund", "Future Token Sale"],
        insiders: ["Pre-Seed (9 investors)", "Seed (11 investors)", "Founders (4 founders)"],
    },
};

export default dfx;
