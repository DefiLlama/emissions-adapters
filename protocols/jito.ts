import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1701907200;
const total = 1e9;

const jito: Protocol = {
  Investors: [
    manualCliff(start + periodToSeconds.year, (total * 0.162) / 3),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(2),
      (total * 0.162 * 2) / 3,
    ),
  ],
  "Core Contributors": [
    manualCliff(start + periodToSeconds.year, (total * 0.245) / 3),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(2),
      (total * 0.245 * 2) / 3,
    ),
  ],
  "Ecosystem Development": manualLinear(
    start,
    start + periodToSeconds.years(6),
    total * 0.25,
  ),
  Airdrop: [
    manualCliff(start, total * 0.09),
    manualLinear(start, start + periodToSeconds.year, total * 0.01),
  ],
  "Community Growth": manualLinear(
    start,
    start + periodToSeconds.years(6),
    total * 0.243,
  ),
  meta: {
    token: `coingecko:jito-governance-token`,
    sources: [
      "https://www.jito.network/blog/announcing-jto-the-jito-governance-token/",
    ],
    notes: [
      `From the chart given in the source material, Jito estimate ~6 year linear vesting schedule for Community Growth and Ecosystem Development sections. Therefore we have used the same in this analysis`,
    ],
    protocolIds: ["2308"],
  },
  categories: {
    noncirculating: ["Ecosystem Development"],
    airdrop: ["Airdrop"],
    farming: ["Community Growth"],
    privateSale: ["Investors"],
    insiders: ["Core Contributors"],
  },
};

export default jito;
