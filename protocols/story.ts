import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const total = 1e9;
const start = 1739404800;

const story: Protocol = {
  "Core Contributors": [
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.months(20),
      total * 0.066,
    ),
    manualLinear(
      start + periodToSeconds.months(20),
      start + periodToSeconds.months(48),
      total * 0.134,
    ),
  ],
  "Early Backers": [
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.months(20),
      total * 0.1,
    ),
    manualLinear(
      start + periodToSeconds.months(20),
      start + periodToSeconds.months(36),
      total * 0.1,
    ),
    manualLinear(
      start + periodToSeconds.months(36),
      start + periodToSeconds.months(48),
      total * 0.016,
    ),
  ],
  Foundation: [
    manualCliff(start, total * 0.05),
    manualLinear(
      start + periodToSeconds.months(10),
      start + periodToSeconds.months(12),
      total * 0.05,
    ),
  ],
  "Initial Incentives": manualCliff(start, total * 0.1),
  "Ecosystem & Community": [
    manualCliff(start, total * 0.1),
    manualLinear(start, start + periodToSeconds.years(4), total * 0.284),
  ],
  meta: {
    notes: [
      "Some of the quantities shown in this analysis have been estimated from the chart in the source material.",
      "This data does not include staking rewards or the effects of the burn mechanism.",
    ],
    sources: ["https://www.story.foundation/blog/introducing-ip"],
    token: "coingecko:story-2",
    protocolIds: ["5778"],
    total,
    chain: 'story'
  },
  categories: {
    farming: ["Initial Incentives","Ecosystem & Community"],
    privateSale: ["Early Backers"],
    insiders: ["Core Contributors","Foundation"],
  },
};

export default story;
