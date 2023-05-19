import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";
import { daoSchedule, latestDao } from "../adapters/balance";

const qty = 13000000;
const start = 1603670400;
const token = "0x875773784Af8135eA0ef43b5a374AaD105c5D39e";
const chain = "ethereum";
const timestampDeployed = 1684510000;

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
  "Long-term rewards": daoSchedule(
    ["0x107A369bc066c77FF061c7d2420618a6ce31B925"],
    token,
    chain,
    "idle",
    timestampDeployed,
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
    manualCliff(start + periodToSeconds.year, (qty * 0.227) / 3),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.year * 3,
      (qty * 0.227 * 2) / 3,
    ),
  ],
  "Ecosystem fund": manualCliff(start, qty * 0.15),
  meta: {
    notes: [
      `There is no schedule for 'Long term rewards', since it is managed by DAO governance. So we have estimated a linear emission in a year's time`,
    ],
    sources: ["https://docs.idle.finance/governance/idle/distribution"],
    token: `${chain}:${token}`,
    protocolIds: ["150"],
    incompleteSections: [
      {
        key: "Long-term rewards",
        allocation: qty * 0.2,
        lastRecord: () => latestDao("idle", timestampDeployed),
      },
    ],
  },
  sections: {
    insiders: ["Team", "Investors"],
    farming: ["Long-term rewards", "Liquidity mining", "early LPs"],
    publicSale: ["Liquidity bootstrap"],
    noncirculating: ["Ecosystem fund"],
  },
};
export default idle;
