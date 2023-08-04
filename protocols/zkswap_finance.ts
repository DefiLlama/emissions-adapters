import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";
const start = 1693558800;
const qty = 1000000000;
const chain: string = "era";
const token: string = "0x";

const zkswap_finance: Protocol = {
    "Token Generation Event (TGE)": manualCliff(start, qty * 0.25),
    "Initial Liquidity": manualCliff(start, qty * 0.125),
    "TGE Bonus": manualLinear(start, start + periodToSeconds.month * 5, qty * 0.05),
    "Early Supporters Retroactive": manualLinear(start, start + periodToSeconds.month * 5, qty * 0.05),
    "Swap2Earn Incentive": manualLinear(start, start + periodToSeconds.month * 36, qty * 0.2),
    "Liquidity Providers Incentive": manualLinear(start, start + periodToSeconds.month * 36, qty * 0.2),
    "Staking Reward": manualLinear(start, start + periodToSeconds.month * 36, qty * 0.05),
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
        publicSale: ["Token Generation Event (TGE)", "Initial Liquidity", "TGE Bonus"],
        farming: ["Liquidity Providers Incentive", "Staking Reward", "Swap2Earn Incentive"],
        airdrop: ["Early Supporters Retroactive"],
        insiders: ["Team"],
        noncirculating: ["Treasury + Operation"],
    },
};

export default zkswap_finance;