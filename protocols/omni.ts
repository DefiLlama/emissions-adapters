import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1713312000;
const total = 1e8;

const saga: Protocol = {
  Airdrop: manualCliff(start, total * 0.03),
  Liquidity: manualCliff(start, total * 0.0627),
  "Ecosystem Development": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.295,
  ),
  "Community Growth": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.1267,
  ),
  "Core Contributors": [
    manualCliff(start + periodToSeconds.year, total * 0.2525 * 0.25),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.months(6),
      4,
      (total * 0.2525 * 0.75) / 4,
    ),
  ],
  Investors: [
    manualCliff(start + periodToSeconds.year, (total * 0.2006) / 3),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.months(6),
      4,
      (total * 0.2006 * 2) / 12,
    ),
  ],
  Advisors: [
    manualCliff(start, 625000),
    manualCliff(start + periodToSeconds.year, 875000),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.months(6),
      4,
      437500,
    ),
  ],
  meta: {
    token: `coingecko:omni-network`,
    sources: ["https://docs.omni.network/learn/omni/token/"],
    notes: [
      `The source material uses a 4 year linear unlock for Ecosystem Development and Community Growth allocations, in this analysis we have used the same.`,
    ],
    protocolIds: ["4609"],
  },
  categories: {
    insiders: ["Core Contributors", "Investors", "Advisors"],
    airdrop: ["Airdrop"],
    publicSale: ["Liquidity"],
    noncirculating: ["Ecosystem Development", "Community Growth"],
  },
};

export default saga;
