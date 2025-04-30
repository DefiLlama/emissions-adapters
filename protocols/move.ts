import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1727391600;
const total = 1e10;

const move: Protocol = {
  "Initial Claims": manualCliff(start, total * 0.1),
  Foundation: [
    manualCliff(start, total * 0.1 * 0.0625),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(5),
      total * 0.1 * 0.9375,
    ),
  ],
  "Early Backers": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(4),
    total * 0.225,
  ),
  "Early Contributors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(5),
    total * 0.175,
  ),
  "Ecosystem & Community": [
    manualCliff(start, total * 0.4 * 0.25),
    manualLinear(start, start + periodToSeconds.years(5), total * 0.4 * 0.75),
  ],
  meta: {
    notes: [
      "No unlocks schedule is described in the docs so in this analysis we have inferred from the charts given in the source material.",
    ],
    token: `coingecko:movement`,
    sources: [
      "https://www.movementnetwork.xyz/article/movement-foundation-move-token",
    ],
    protocolIds: ["5630"],
    total,
  },
  categories: {
    airdrop: ["Initial Claims"],
    farming: ["Ecosystem & Community"],
    privateSale: ["Early Backers"],
    insiders: ["Early Contributors","Foundation"],
  },
};

export default move;
