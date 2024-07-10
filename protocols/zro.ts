import { Protocol } from "../types/adapters";
import { manualLinear, manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const total = 1e9;
const start = 1718841600;

const zro: Protocol = {
  "Community Allocation": [
    manualCliff(start, total * 0.25),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      total * 0.133,
    ),
  ],
  "Tokens Repurchased": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.04,
  ),
  "Core Contributors": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    24,
    (total * 0.255) / 24,
  ),
  "Strategic Partners": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    24,
    (total * 0.322) / 24,
  ),
  meta: {
    notes: [
      `Some of the Community Allocation (13.3% of total) has no given emission schedule. In this analysis we have used a 2 year linear unlock, like the chart shown in the source material.`,
    ],
    sources: ["https://info.layerzero.foundation/introducing-zro-d39df554a9b7"],
    token: "coingecko:layerzero",
    protocolIds: ["4867"],
  },
  categories: {
    farming: ["Community Allocation", "Tokens Repurchased"],
    insiders: ["Core Contributors", "Strategic Partners"],
  },
};

export default zro;
