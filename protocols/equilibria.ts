import { manualCliff, manualLinear, manualLog } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";
import { latest, incentives } from "../adapters/equilibria";

const start: number = 1685055600;
const qty: number = 100e6;

const equilibria: Protocol = {
  // Airdrop: manualCliff(unixTimestampNow(), qty * 0.02),
  "Boostrapping Incentives": manualCliff(
    start + periodToSeconds.month * 6,
    qty * 0.02,
  ),
  // "Pendle LP Incentives, Team & Advisors": () =>
  //   incentives("equilibria", ["ethereum", "arbitrum"], qty * 0.45),
  "Liquidity Mining": manualLog(
    start,
    start + periodToSeconds.year * 5,
    qty * 0.1,
    periodToSeconds.week,
    1.1,
    false,
  ),
  "Equilibria Treasury": [
    manualCliff(start, qty * 0.145 * 0.3),
    manualLinear(start, start + periodToSeconds.year * 2, qty * 0.145 * 0.7),
  ],
  "Presale Investors": [
    manualCliff(start + periodToSeconds.month * 3, qty * 0.025 * 0.125),
    manualLinear(
      start + periodToSeconds.month * 3,
      start + periodToSeconds.year * 2,
      qty * 0.025 * 0.875,
    ),
  ],
  IDO: [
    manualCliff(start, qty * 0.075 * 0.5),
    manualCliff(start + periodToSeconds.month * 6, qty * 0.075 * 0.5),
  ],
  meta: {
    sources: ["https://docs.equilibria.fi/token/eqb/tokenomics"],
    token: "arbitrum:0xbfbcfe8873fe28dfa25f1099282b088d52bbad9c",
    protocolIds: ["3091"],
    notes: [
      `Pendle LP Incentives and Team & Advisors allocations depend on PENDLE earnt. This is unpredictable, therefore these sections have been excluded from the analysis.`,
      // `Team & Advisors allocation is linked to performance, and deducted from LP incentives. Here we have shown Team & Advisors, and LP incentives, as one section.`,
      `Airdrop (2%) details to be announced later. We have excluded this allocation from analysis.`,
    ],
    incompleteSections: [
      {
        key: "Pendle LP Incentives, Team & Advisors",
        allocation: qty * 0.45,
        lastRecord: () => latest("equilibria"),
      },
    ],
  },
  categories: {
    insiders: ["Presale Investors"],
    publicSale: ["IDO"],
    noncirculating: ["Equilibria Treasury"],
    farming: ["Liquidity Mining", "Boostrapping Incentives"],
  },
  total: qty,
};
export default equilibria;
