import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";
import { balance, latest } from "../adapters/balance";

const qty = 13000000;
const start = 1603670400;
const token = "0x875773784Af8135eA0ef43b5a374AaD105c5D39e";
const chain = "ethereum";
const timestampDeployed = 1683068400;
const timestampDeployed2 = 1612310400;

const idle: Protocol = {
  "early LPs": manualCliff(start, qty * 0.04),
  "Liquidity bootstrap": manualLinear(
    start,
    start + periodToSeconds.day * 30,
    qty * 0.03,
  ),
  "Liquidity mining": [
    manualLinear(start, start + periodToSeconds.year * 2, qty * 0.18),
  ],
  "Long-term rewards": () =>
    balance(
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
      start + periodToSeconds.month * 18,
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
  "Ecosystem fund": () =>
    balance(
      ["0xb0aA1f98523Ec15932dd5fAAC5d86e57115571C7"],
      token,
      chain,
      "idle",
      timestampDeployed2,
    ),
  meta: {
    sources: ["https://docs.idle.finance/governance/idle/distribution"],
    token: `${chain}:${token}`,
    protocolIds: ["150"],
    incompleteSections: [
      {
        key: "Long-term rewards",
        allocation: qty * 0.2,
        lastRecord: () => latest("idle", timestampDeployed),
      },
      {
        key: "Ecosystem fund",
        allocation: qty * 0.15,
        lastRecord: () => latest("idle", timestampDeployed2),
      },
    ],
  },
  categories: {
    insiders: ["Team", "Investors"],
    farming: ["Long-term rewards", "Liquidity mining", "early LPs"],
    publicSale: ["Liquidity bootstrap"],
    noncirculating: ["Ecosystem fund"],
  },
  total: qty
};
export default idle;
