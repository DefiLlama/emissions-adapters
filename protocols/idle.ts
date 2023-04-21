import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const qty = 13000000;
const start = 1603670400;
const idle: Protocol = {
  "early LPs": manualCliff(start, qty * 0.04),
  "Liquidity bootstrap": manualLinear(
    start,
    start + periodToSeconds.day * 30,
    qty * 0.03,
  ),
  "Liquidity mining": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    qty * 0.18,
  ),
  "Long-term rewards": manualLinear(
    new Date().getTime() / 1000 + periodToSeconds.year,
    new Date().getTime() / 1000 + periodToSeconds.year * 3,
    qty * 0.2,
  ),
  Investors: [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.173 * 0.25),
    manualLinear(
      start + periodToSeconds.month * 6,
      periodToSeconds.month * 18,
      qty * 0.173 * 0.75,
    ),
  ],
  Team: [
    manualCliff(start + periodToSeconds.year, qty * 0.227 / 3),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.year * 3,
      qty * 0.227 * 2 / 3,
    ),
  ],
  "Ecosystem fund": manualCliff(start, qty * 0.15),
  meta: {
    notes: [
      `There is no schedule for 'Long term rewards', since it is managed by DAO governance. So we have estimated a linear emission in a year's time`,
    ],
    sources: ["https://docs.idle.finance/governance/idle/distribution"],
    token: "ethereum:0x875773784Af8135eA0ef43b5a374AaD105c5D39e",
    protocolIds: ["150"],
  },
  sections: {
    insiders: ["Team", "Investors"],
    farming: ["Long-term rewards", "Liquidity mining", "early LPs"],
    publicSale: ["Liquidity bootstrap"],
    noncirculating: ["Ecosystem fund"],
  },
};
export default idle;
