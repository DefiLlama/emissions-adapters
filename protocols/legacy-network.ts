import { manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const chain: any = "binance";
const LGCT: string = "0xD38B305CaC06990c0887032A02C03D6839f770A8";
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
      `The token is cross-bridge and available on Binance Smart Chain, Ethereum, Base and Vechain.`,
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
