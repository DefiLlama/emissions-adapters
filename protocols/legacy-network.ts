import { manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const chain: any = "bsc";
const LGCT: string = "0xD38B305CaC06990c0887032A02C03D6839f770A8";

const lgct: Protocol = {
  "Public Sale": manualLinear("2025-01-7", "2026-09-06", 45e6),
  "Community and Marketing": manualLinear("2025-09-22", "2035-01-06", 15e6),
  "Advisors and Partners": manualLinear("2025-01-7", "2026-09-06", 15e6),
  "CEX and AMM Liquidity": manualLinear("2025-01-7", "2026-05-06", 24e6),
  Treasury: manualLinear("2026-02-06", "2031-01-06", 15e6),
  Team: manualLinear("2026-10-06", "2029-01-06", 39e6),
  meta: {
    sources: ["https://docs.legacynetwork.io/products/legacy-token"],
    token: `${chain}:${LGCT}`,
    protocolIds: ["5904"],
    notes: [],
  },
  categories: {
    insiders: ["Team", "Advisors and Partners"],
    publicSale: ["Public Sale", "CEX and AMM Liquidity"],
    noncirculating: ["Community and Marketing", "Treasury"],
  },
};
export default lgct;
