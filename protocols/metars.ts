import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1646611200;
const total = 1e9;

const metars: Protocol = {
  Foundation: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(16),
    total * 0.03,
  ),
  "Community Activity": [
    manualCliff(start, total * 0.01),
    manualLinear(start, periodToSeconds.months(20), total * 0.04),
  ],
  "Backer Airdrop": [
    manualCliff(start, total * 0.01),
    manualLinear(start, periodToSeconds.months(20), total * 0.04),
  ],
  "AI Partnership Funding": manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(36),
    total * 0.3,
  ),
  "Ecosystem Funding": [
    manualCliff(start, total * 0.005),
    manualLinear(start, periodToSeconds.months(20), total * 0.195),
  ],
  "Creative Rewards": manualLinear(
    1672531200, // Jan 23
    periodToSeconds.months(20),
    total * 0.2,
  ),

  Team: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(21),
    total * 0.15,
  ),
  Marketing: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(16),
    total * 0.02,
  ),
  meta: {
    token: `bsc:0x238d02ee3f80fbf5e381f049616025c186889b68`,
    sources: [
      "https://metars-1.gitbook.io/metars-whitepaper/product-guides/tokenomics-and-governance",
    ],
    protocolIds: ["4608"],
  },
  categories: {
    insiders: [
      "Foundation",
      "AI Partnership Funding",
      "Ecosystem Funding",
      "Team",
    ],
    noncirculating: ["Community Activity", "Marketing"],
    airdrop: ["Backer Airdrop"],
    farming: ["Creative Rewards"],
  },
};

export default metars;
