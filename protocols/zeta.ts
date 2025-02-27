import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const total = 21e8;
const start = 1697670000;

const zeta: Protocol = {
  "User Growth Pool": [
    manualCliff(start, total * 0.045),
    manualStep(
      start + periodToSeconds.month,
      periodToSeconds.month,
      5,
      total * 0.002,
    ),
    manualStep(
      start + periodToSeconds.months(6),
      periodToSeconds.month,
      36,
      (total * 0.045) / 36,
    ),
  ],
  "Ecosystem Growth Fund": [
    manualCliff(start, total * 0.015),
    manualStep(
      start + periodToSeconds.months(6),
      periodToSeconds.month,
      42,
      (total * 0.105) / 42,
    ),
  ],
  "Validator Incentives": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.1,
  ),
  "Liquidity Incentives": [
    manualCliff(start, total * 0.03),
    manualStep(
      start + periodToSeconds.month,
      periodToSeconds.month,
      48,
      (total * 0.025) / 48,
    ),
  ],
  "Protocol Treasury": [
    manualCliff(start, total * 0.02),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      36,
      (total * 0.22) / 36,
    ),
  ],
  "Core Contributors": [
    manualStep(
      start + periodToSeconds.months(6),
      periodToSeconds.month,
      6,
      (total * 0.225) / 18,
    ),
    manualStep(
      start + periodToSeconds.months(12),
      periodToSeconds.month,
      24,
      (total * 0.225) / 36,
    ),
  ],
  "Purchasers & Advisors": [
    manualStep(
      start + periodToSeconds.months(6),
      periodToSeconds.month,
      6,
      (total * 0.16) / 18,
    ),
    manualStep(
      start + periodToSeconds.months(12),
      periodToSeconds.month,
      24,
      (total * 0.16) / 36,
    ),
  ],
  Inflation: manualLinear(
    start + periodToSeconds.years(4),
    start + periodToSeconds.years(8),
    21e7,
  ),
  meta: {
    sources: [
      `https://www.zetachain.com/docs/about/token-utility/distribution/`,
    ],
    token: "ethereum:0xf091867ec603a6628ed83d274e835539d82e9cc8",
    protocolIds: ["4556"],
    notes: [
      `There is no detail about the unlock rate of Validator Incentives, so we've used a linear unlock.`,
    ],
  },
  categories: {
    farming: [
      "User Growth Pool",
      "Validator Incentives",
      "Liquidity Incentives",
    ],
    noncirculating: ["Ecosystem Growth Fund", "Protocol Treasury"],
    insiders: ["Core Contributors", "Purchasers & Advisors"],
  },
};

export default zeta;
