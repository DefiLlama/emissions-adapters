import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1713830400;
const total = 1e8;

const safe: Protocol = {
  Airdrop: [
    manualCliff(start, total * 0.025),
    manualLinear(start, start + periodToSeconds.years(4), total * 0.025),
  ],
  "Core Contributors": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.15,
  ),
  "Grants & Reserve": [
    manualCliff(start, total * 0.02),
    manualLinear(start, start + periodToSeconds.years(4), total * 0.05),
  ],
  Ecosystem: [
    manualCliff(start, total * 0.0125),
    manualLinear(start, start + periodToSeconds.years(4), total * 0.0375),
  ],
  "SafeDAO Treasury": [
    manualCliff(start, total * 0.05),
    manualLinear(start, start + periodToSeconds.years(8), total * 0.35),
  ],
  "GnosisDAO Treasury": [
    manualCliff(start, total * 0.01),
    manualLinear(start, start + periodToSeconds.years(8), total * 0.14),
  ],
  "Joint Treasury": manualCliff(start, total * 0.05),
  "Strategic Raise": [
    manualCliff(start + periodToSeconds.year, total * 0.02),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      total * 0.06,
    ),
  ],
  meta: {
    sources: [`https://safe.global/blog/safe-tokenomics`],
    token: "coingecko:safe",
    protocolIds: ["3320"],
  },
  categories: {
    farming: ["Ecosystem"],
    insiders: ["Core Contributors", "Grants & Reserve", "Strategic Raise"],
    noncirculating: [
      "SafeDAO Treasury",
      "GnosisDAO Treasury",
      "Joint Treasury",
    ],
    airdrop: ["Airdrop"],
  },
};
export default safe;
