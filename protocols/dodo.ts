import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 1000000000;
const start = 1597449600;

const dodo: Protocol = {
  "Team & consultants": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 3,
    qty * 0.15,
  ),
  "Seed investors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 3,
    qty * 0.06,
  ),
  "private round investors": [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.1 * 0.1),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.month * 18,
      qty * 0.1 * 0.9,
    ),
  ],
  IDO: manualCliff(start, qty * 0.01),
  "Operations, marketing, partners": manualCliff(start, qty * 0.08),
  //"Community incentives": manualCliff(start, qty * 0.6),
  meta: {
    sources: ["https://docs.dodoex.io/english/tokenomics/dodo-allocation"],
    token: "ethereum:0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd",
    notes: [
      `Community incentives (60%) are released on an uncofirmed schedule, so have been excluded from this analysis.`,
    ],
    protocolIds: ["146"],
  },
  sections: {
    insiders: [
      "Team & consultants",
      "Seed investors",
      "private round investors",
      "Operations, marketing, partners",
    ],
    publicSale: ["IDO"],
  },
};

export default dodo;
