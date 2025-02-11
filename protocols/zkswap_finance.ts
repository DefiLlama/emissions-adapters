import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";
const start = 1693558800;
const halfTime = start + periodToSeconds.month * 18;
const endTime = start + periodToSeconds.month * 48;
const qty = 1000000000;
const chain: string = "era";
const token: string = "0x31C2c031fDc9d33e974f327Ab0d9883Eae06cA4A";

const zkswap_finance: Protocol = {
    "Token Generation Event (TGE)": manualCliff(start, qty * 0.25),
    "Initial Liquidity": manualCliff(start, qty * 0.125),
    "TGE Bonus": manualLinear(start, start + periodToSeconds.month * 5, qty * 0.05),
    "Early Supporters Retroactive": manualLinear(start, start + periodToSeconds.month * 5, qty * 0.05),
    "Swap2Earn Incentive": [manualLinear(start, halfTime, qty * 0.2 * 0.5), manualLinear(halfTime, endTime, qty * 0.2 * 0.5)],
    "Liquidity Providers Incentive": [manualLinear(start, halfTime, qty * 0.2 * 0.5), manualLinear(halfTime, endTime, qty * 0.2 * 0.5)],
    "Staking Reward": [manualLinear(start, halfTime, qty * 0.05 * 0.5), manualLinear(halfTime, endTime, qty * 0.05 * 0.5)],
    "Team": [manualLinear(start, halfTime, qty * 0.04 * 0.5), manualLinear(halfTime, endTime, qty * 0.04 * 0.5)],
    "Treasury + Operation": [manualLinear(start, halfTime, qty * 0.035 * 0.5), manualLinear(halfTime, endTime, qty * 0.035 * 0.5)],
    meta: {
        token: `${chain}:${token}`,
        sources: [
            "https://docs.zkswap.finance/dao-and-tokenomics/tokenomics",
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