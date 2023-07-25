import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1689634800;
const qty = 1e9;
const token = "0x6e2a43be0b1d33b726f0ca3b8de60b3482b8b050";
const chain = "ethereum";

const insiderSchedule = (perc: number) =>
  manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 4,
    perc * qty,
  );
const ecosystemSchedule = (perc: number) => [
  manualCliff(start, qty * perc * 0.268),
  manualLinear(start, start + periodToSeconds.year * 5, qty * perc * 0.742),
];

const arkham: Protocol = {
  "Community Rewards": ecosystemSchedule(0.107),
  "Contributor Incentive Pool": ecosystemSchedule(0.1),
  "DON PoS Rewards": ecosystemSchedule(0.1), // category????
  "Ecosystem Grants": ecosystemSchedule(0.066),
  "Core Contributors": insiderSchedule(0.2),
  Investors: insiderSchedule(0.175),
  "Foundation Treasury": manualLinear(
    start,
    start + periodToSeconds.year * 7,
    qty * 0.172,
  ),
  "Binance Launchpad": manualCliff(start, qty * 0.05),
  Advisors: insiderSchedule(0.03),
  meta: {
    token: `${chain}:${token}`,
    sources: ["https://codex.arkhamintelligence.com/tokenomics"],
    notes: [
      `DON PoS Rewards program is yet to be announced, here we have assumed its a farming program.`,
    ],
    protocolIds: ["3269"],
  },
  categories: {
    farming: [
      "Community Rewards",
      "Contributor Incentive Pool",
      "DON PoS Rewards",
    ],
    noncirculating: ["Ecosystem Grants", "Foundation Treasury"],
    insiders: ["Core Contributors", "Investors", "Advisors"],
    publicSale: ["Binance Launchpad"],
  },
};

export default arkham;
