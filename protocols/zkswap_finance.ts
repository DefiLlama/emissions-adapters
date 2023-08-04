import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";
const start = 1693558800;
const qty = 1000000000;
const chain: string = "era";
const token: string = "0x";

const zkswap_finance: Protocol = {
    "Public Sale": manualCliff(start, qty * 0.25),
    "Liquidity": manualCliff(start, qty * 0.125),
    "TGE Bonus": manualLinear(start, start + periodToSeconds.month * 4, qty * 0.05),
    "SWAP2EARN": manualLinear(start, start + periodToSeconds.month * 36, qty * 0.2),
    "Farming": manualLinear(start, start + periodToSeconds.month * 36, qty * 0.2),
    "Staking": manualLinear(start, start + periodToSeconds.month * 36, qty * 0.05),
    "Team": manualLinear(start, start + periodToSeconds.month * 36, qty * 0.04),
    "Treasury + Operation": manualLinear(start, start + periodToSeconds.month * 36, qty * 0.035),
    meta: {
        token: `${chain}:${token}`,
        sources: [
            "https://zkswapfinance.gitbook.io/zkswap/usdzf-token/tokenomics",
        ],
        protocolIds: ["3180"],
    },
    categories: {
        insiders: [
            "Team"
        ],
        publicSale: ["Public Sale"],
        farming: ["Farming"],
    },
};

export default zkswap_finance;
