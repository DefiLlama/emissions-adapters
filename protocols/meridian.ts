import { manualCliff, manualLinear } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 0;

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
    token: "ethereum:0xf4d2888d29D722226FafA5d9B24F9164c092421E",
    protocolIds: ["1229"],
  },
  categories: {
    airdrop: ["Community Airdrop"],
    farming: ["Stability Pool Rewards", "LP Rewards"],
    publicSale: ["Seed LP Funding"],
    insiders: ["Team & Advisors"],
  },
};

export default meridian;
