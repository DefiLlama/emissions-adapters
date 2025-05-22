import {
  manualCliff,
  manualLinear,
  manualLog,
  manualStep,
} from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1673226000;
const total = 1e11;

const flare: Protocol = {
  "Flare Labs": [
    manualCliff(start, total * 0.125 * 0.15),
    manualStep(start, periodToSeconds.month, 35, total * 0.125 * 0.0237),
    manualCliff(start + periodToSeconds.months(36), total * 0.125 * 0.0205),
  ],
  "Flare VC Fund": [
    manualCliff(start, total * 0.1 * 0.15),
    manualStep(start, periodToSeconds.month, 35, total * 0.1 * 0.0237),
    manualCliff(start + periodToSeconds.months(36), total * 0.1 * 0.0205),
  ],
  "Flare Foundation": [
    manualCliff(start, total * 0.098 * 0.15),
    manualStep(start, periodToSeconds.month, 35, total * 0.098 * 0.0237),
    manualCliff(start + periodToSeconds.months(36), total * 0.098 * 0.0205),
  ],
  "Initial Airdrop": manualCliff(start, total * 0.043),
  FlareDrop: [
    manualStep(start, periodToSeconds.month, 35, total * 0.266 * 0.0279),
    manualCliff(start + periodToSeconds.months(36), total * 0.266 * 0.0235),
  ],
  "Incentive Pool": manualLog(
    start,
    start + periodToSeconds.years(8),
    total * 0.2,
    periodToSeconds.month,
    0.1,
  ),
  Team: [
    manualCliff(start, total * 0.085 * 0.15),
    manualStep(start, periodToSeconds.month, 35, total * 0.085 * 0.0237),
    manualCliff(start + periodToSeconds.months(36), total * 0.085 * 0.0205),
  ],
  "Future Team": [], // TBC
  Advisors: [
    manualCliff(start + periodToSeconds.months(6), total * 0.02 * 0.1),
    manualCliff(start + periodToSeconds.months(12), total * 0.02 * 0.25),
    manualCliff(start + periodToSeconds.months(12), total * 0.02 * 0.65),
  ],
  Backers: [
    manualStep(
      start + periodToSeconds.months(3),
      periodToSeconds.month,
      39,
      5e7,
    ),
    manualCliff(start + periodToSeconds.months(42), 1.15e9),
  ],
  Inflation: [
    manualStep(start, periodToSeconds.month, 12, 35e8 / 12),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      12,
      44e8 / 12,
    ),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      12,
      45e8 / 12,
    ),
  ],
  meta: {
    sources: [
      "https://flare.network/tokenomics-flr-updated/",
      "https://docs.flare.network/tech/tokenomics/",
    ],
    token: "coingecko:flare-networks",
    notes: [
      `Incentive pool emissions have been estimated based on info in the source materials.`,
      `It cant be known when future team members will join, so this section (1.5% of total) has been excluded from the analysis.`,
    ],
    protocolIds: ["4665"],
    chain: 'flare'
  },
  categories: {
    farming: ["Inflation","Incentive Pool"],
    airdrop: ["Initial Airdrop","FlareDrop"],
    privateSale: ["Backers"],
    insiders: ["Flare Labs","Flare VC Fund","Flare Foundation","Team","Future Team","Advisors"],
  },
};
export default flare;
