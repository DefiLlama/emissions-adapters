import { manualCliff, manualLinear } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1690934400;

const meridian: Protocol = {
  "Community Airdrop": manualCliff(start, 3e6),
  "LP Rewards": manualCliff(start, 25e5),
  "Seed LP Funding": manualCliff(start, 5e5),
  "Team & Advisors": manualCliff(start, 1e6),
  "Stability Pool Rewards": [
    manualLinear(start, start + periodToSeconds.year, 1500e3),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.year * 2,
      750e3,
    ),
    manualLinear(
      start + periodToSeconds.year * 2,
      start + periodToSeconds.year * 3,
      375e3,
    ),
    manualLinear(
      start + periodToSeconds.year * 3,
      start + periodToSeconds.year * 4,
      188e3,
    ),
    manualLinear(
      start + periodToSeconds.year * 4,
      start + periodToSeconds.year * 5,
      94e3,
    ),
  ],
  meta: {
    sources: ["https://docs.meridianfinance.net/tokenomics"],
    token: "base:0x2F3b1A07E3eFb1fCc64BD09b86bD0Fa885D93552",
    protocolIds: ["3347"],
  },
  categories: {
    airdrop: ["Community Airdrop"],
    farming: ["Stability Pool Rewards", "LP Rewards"],
    publicSale: ["Seed LP Funding"],
    insiders: ["Team & Advisors"],
  },
};

export default meridian;
