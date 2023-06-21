import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start: number = 1687302000;
const qty: number = 10e6;

const penpie: Protocol = {
  "Liquidity mining": [
    manualCliff(start, qty * 0.35 * 0.2),
    manualLinear(start, start + periodToSeconds.year * 4, qty * 0.35 * 0.8),
  ],
  IDO: [
    manualCliff(start, qty * 0.2 * 0.3),
    manualLinear(start, start + periodToSeconds.year, qty * 0.2 * 0.3),
  ],
  "Magpie Treasury": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    qty * 0.2,
  ),
  "Pendle Treasury": manualLinear(
    start,
    start + periodToSeconds.year,
    qty * 0.1,
  ),
  "Initial Liquidity": manualCliff(start, 0.07),
  "Marketing & BD": [
    manualCliff(start, qty * 0.05 * 0.2),
    manualLinear(start, start + periodToSeconds.year * 2, qty * 0.05 * 0.8),
  ],
  "PENDLE Rush": [
    manualCliff(start, qty * 0.03 * 0.3),
    manualLinear(start, start + periodToSeconds.year, qty * 0.03 * 0.7),
  ],
  meta: {
    sources: ["https://docs.penpiexyz.io/tokens/pnp-token/pnp-distribution"],
    token: "ethereum:0x7dedbce5a2e31e4c75f87fea60bf796c17718715",
    protocolIds: ["3083"],
  },
  categories: {
    insiders: ["Magpie Treasury", "Pendle Treasury", "Marketing & BD"],
    farming: ["Liquidity mining"],
    publicSale: ["Initial Liquidity", "PENDLE Rush", "IDO"],
  },
};
export default penpie;
