import { manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const chain: any = "binance";
const LGCT: string = "0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4";
const lgct: Protocol = {
  "Public Sale": manualLinear("2025-01-7","2026-09-06", 45e6),
  "Community and Marketing": manualLinear("2025-09-22", "2035-01-06", 15e6),
  "Advisors and Partners": manualLinear("2025-01-7","2026-09-06", 15e6),

  "CEX and AMM Liquidity": manualLinear("2025-01-7","2026-05-06",  24e6),
  "Treasury": manualLinear("2026-02-06","2031-01-06", 15e6),
  Team: manualLinear("2026-10-06", "2029-01-06", 39e6),

  meta: {
    sources: [
      "https://docs.legacynetwork.io/products/legacy-token",
      "https://cryptorank.io/price/legacy-token",
    ],
    token: `${chain}:${LGCT}`,
    protocolIds: [""],
    notes: [
      `Dates are generally rounded to the nearest month since little information is available.`,
    ],
  },
  categories: {
    insiders: [
      "Team",
    ],
    publicSale: ["Public Sale"],
    noncirculating: ["Community and Marketing", "Advisors and Partners", "CEX and AMM Liquidity", "Treasury"],
  },
};
export default lgct;
