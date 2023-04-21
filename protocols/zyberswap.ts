import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const start = 1674410400;
const qty = 20000000 - 10000;
const zyberswap: Protocol = {
  "liquidity incentives": manualLinear(start, start + 66633333, qty * 0.865),
  team: manualLinear(start, start + 66633333, qty * 0.09),
  marketing: manualLinear(start, start + 66633333, qty * 0.045),
  "initial liquidity": manualCliff(start, 10000),
  meta: {
    token: "arbitrum:0x3b475f6f2f41853706afc9fa6a6b8c5df1a2724c",
    sources: ["https://docs.zyberswap.io/tokenomics/zyber-token"],
    protocolIds: ["2467", "2530", "2602"],
  },
  sections: {
    farming: ["liquidity incentives"],
    insiders: ["team", "marketing"],
    publicSale: ["initial liquidity"],
  },
};

export default zyberswap;
