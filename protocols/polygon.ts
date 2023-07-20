import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const qty: number = 1e10;
const token: string = "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0";
const start: number = 1554073200;

const polygon: Protocol = {
  "Launchpad Sale": manualCliff(start, qty * 0.19),
  Seed: manualStep(start, periodToSeconds.month * 6, 2, (qty * 0.0209) / 2),
  "Early Supporters": manualStep(
    start,
    periodToSeconds.month * 6,
    2,
    (qty * 0.0171) / 2,
  ),
  Team: manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month * 6,
    5,
    (qty * 0.16) / 5,
  ),
  Advisors: manualStep(
    start + periodToSeconds.month * 6,
    periodToSeconds.month * 6,
    3,
    (qty * 0.04) / 3,
  ),
  Foundation: manualStep(
    start,
    periodToSeconds.month * 6,
    8,
    (qty * 0.2186) / 8,
  ),
  Ecosystem: manualStep(
    start,
    periodToSeconds.month * 6,
    8,
    (qty * 0.2333) / 8,
  ),
  "Staking Rewards": [
    manualCliff(start, qty * 0.04),
    manualLinear(start, 1669852800, qty * 0.08),
  ],
  meta: {
    notes: [
      `Specific dates have been estimated using the release schedule chart in the source material.`,
    ],
    sources: [`https://research.binance.com/en/projects/matic-network`],
    token: `ethereum:${token}`,
    protocolIds: ["240"],
  },
  categories: {
    publicSale: ["Launchpad Sale"],
    insiders: ["Seed", "Early Supporters", "Team", "Advisors"],
    noncirculating: ["Foundation", "Ecosystem"],
    farming: ["Staking Rewards"],
  },
};
export default polygon;
