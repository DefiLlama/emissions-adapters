import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1765152000;
const total = 100e9;

const stable: Protocol = {
  "Genesis Distribution": manualCliff(start, total * 0.10),
  "Ecosystem & Community": [
    manualCliff(start, total * 0.08),
    manualStep(start, periodToSeconds.month, 36, (total * 0.32) / 36),
  ],
  Team: manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    36,
    (total * 0.25) / 36,
  ),
  "Investors & Advisors": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    36,
    (total * 0.25) / 36,
  ),
  meta: {
    token: "coingecko:stable-2",
    sources: ["https://docs.stable.xyz/en/introduction/tokenomics"],
    protocolIds: ["7086"],
  },
  categories: {
    publicSale: ["Genesis Distribution"],
    farming: ["Ecosystem & Community"],
    insiders: ["Team", "Investors & Advisors"],
  },
};

export default stable;
