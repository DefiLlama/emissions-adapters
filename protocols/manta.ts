import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1679439600;
const total = 1e9;
const token = "0x95cef13441be50d20ca4558cc0a27b601ac544e5";
const chain = "manta";

const manta: Protocol = {
  "Public Sale": [
    manualCliff(start, total * 0.04),
    manualStep(start, periodToSeconds.month, 6, (total * 0.04) / 6),
  ],
  "Private Round": [
    manualCliff(start + periodToSeconds.year, (total * 0.1294) / 4),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      (total * 0.1294 * 3) / 4,
    ),
  ],
  "Strategic Investors": [
    manualCliff(start + periodToSeconds.year, (total * 0.0617) / 4),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      (total * 0.0617 * 3) / 4,
    ),
  ],
  "Institution Investors": [
    manualCliff(start + periodToSeconds.year, (total * 0.05) / 4),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      (total * 0.05 * 3) / 4,
    ),
  ],
  Airdrop: manualCliff(start, total * 0.056),
  "Binanace Launchpool": manualCliff(start, total * 0.03),
  "Ecosystem / Community": [
    manualCliff(start, total * 0.05),
    manualLinear(start, start + periodToSeconds.years(4), total * 0.16119),
  ],
  Foundation: manualLinear(
    start,
    start + periodToSeconds.years(6),
    total * 0.135,
  ),
  "New Paradigm (Airdrop 2)": [
    manualCliff(start, total * 0.05),
    manualCliff(start + periodToSeconds.months(3), total * 0.015),
  ],
  Team: [
    manualCliff(start + periodToSeconds.months(18), (total * 0.1 * 3) / 11),
    manualLinear(
      start + periodToSeconds.months(18),
      start + periodToSeconds.months(66),
      (total * 0.1 * 8) / 11,
    ),
  ],
  Advisor: [
    manualCliff(start, total * 0.025),
    manualStep(start, periodToSeconds.month, 30, (total * 0.056) / 30),
  ],
  Inflation: manualLinear(start, start + periodToSeconds.years(6), 126162419),
  meta: {
    token: `${chain}:${token}`,
    sources: ["https://mantanetwork.medium.com/manta-tokenomics-b226f911c84c"],
    protocolIds: ["4032"],
  },
  categories: {
    publicSale: ["Public Sale", "Binanace Launchpool"],
    insiders: [
      "Private Round",
      "Strategic Investors",
      "Institution Investors",
      "Team",
      "Advisor",
    ],
    airdrop: ["Airdrop", "New Paradigm (Airdrop 2)"],
    noncirculating: ["Ecosystem / Community", "Foundation"],
  },
};

export default manta;
