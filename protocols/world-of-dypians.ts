import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { months } from "../utils/time";

const start = 1732665600; // Nov 27, 2024
const total = 1_000_000_000;

const worldOfDypians: Protocol = {
  Seed: [
    manualCliff(start, total * 0.08 * 0.04),
    manualLinear(months(start, 6), months(start, 25), total * 0.08 * 0.96),
  ],
  Private: [
    manualCliff(start, total * 0.085 * 0.06),
    manualLinear(months(start, 3), months(start, 19), total * 0.085 * 0.94),
  ],
  KOL: [
    manualCliff(start, total * 0.015 * 0.15),
    manualLinear(months(start, 1), months(start, 9), total * 0.015 * 0.85),
  ],
  Public: [
    manualCliff(start, total * 0.02 * 0.20),
    manualLinear(start, months(start, 6), total * 0.02 * 0.80),
  ],
  Team: manualLinear(months(start, 12), months(start, 48), total * 0.12),
  Advisors: manualLinear(months(start, 9), months(start, 39), total * 0.05),
  Community: [
    manualCliff(start, total * 0.30 * 0.02),
    manualLinear(start, months(start, 48), total * 0.30 * 0.98),
  ],
  Ecosystem: manualLinear(months(start, 1), months(start, 37), total * 0.25),
  Liquidity: [
    manualCliff(start, total * 0.08 * 0.5),
    manualLinear(start, months(start, 3), total * 0.08 * 0.5),
  ],

  meta: {
    token: "bsc:0xb994882a1b9bd98a71dd6ea5f61577c42848b0e8",
    sources: ["https://www.worldofdypians.com/about#tokenomics"],
    protocolIds: ["7629"],
    total,
  },
  categories: {
    insiders: ["Team", "Advisors", "KOL"],
    privateSale: ["Seed", "Private"],
    publicSale: ["Public"],
    farming: ["Community"],
    noncirculating: ["Ecosystem"],
    liquidity: ["Liquidity"],
  },
};

export default worldOfDypians;
