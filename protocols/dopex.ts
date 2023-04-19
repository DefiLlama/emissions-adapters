import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 500000;
const start = 1633647600;

const dopex: Protocol = {
  "Operational allocation": manualLinear(
    start,
    start + periodToSeconds.year * 5,
    qty * 0.17,
  ),
  Farming: manualLinear(start, start + periodToSeconds.year * 2, qty * 0.15),
  "Platform rewards": manualLinear(
    start,
    start + periodToSeconds.year * 5,
    qty * 0.3,
  ),
  Founders: [
    manualCliff(start, qty * 0.12 * 0.2),
    manualLinear(start, start + periodToSeconds.year * 2, qty * 0.12 * 0.8),
  ],
  "Early investors": manualLinear(
    start,
    start + periodToSeconds.year / 2,
    qty * 0.11,
  ),
  "Token sale": manualCliff(start, qty * 0.15),
  meta: {
    sources: ["https://docs.dopex.io/tokenomics/tokenomics"],
    token: "ethereum:0xeec2be5c91ae7f8a338e1e5f3b5de49d07afdc81",
    notes: [
      `Many of the sections here have no given emission schedule, however in this analysis we inferred from the chart at the source than many of the unlocks are linear.`,
    ],
    protocolIds: ["660"],
  },
  sections: {
    insiders: ["Founders", "Early investors", "Operational allocations"],
    farming: ["Farming", "Platform rewards"],
    publicSale: ["Token sale"],
  },
};

export default dopex;
