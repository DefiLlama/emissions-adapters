import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1712620800;
const total = 1e8;

const saga: Protocol = {
  "Core Contributors": [
    manualCliff(start + periodToSeconds.year, total * 0.05),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      total * 0.15,
    ),
  ],
  Fundraising: [
    manualCliff(start + periodToSeconds.year, total * 0.05),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      total * 0.15,
    ),
  ],
  "Ecosystem & Development": [],
  "Foundation & Reserve": [],
  Airdrops: [
    manualCliff(start, total * 0.06),
    // manualCliff(0, total * 0.04), // 2-6
    // manualCliff(0, total * 0.1), // 6
  ],
  meta: {
    token: `coingecko:saga-2`,
    sources: [
      "https://medium.com/sagaxyz/saga-mainnet-technical-launch-plan-c084b1426acc",
    ],
    notes: [
      `14% of total supply is allocated to future airdrops with no available information. Therefore this has been excluded from our analysis.`,
    ],
    protocolIds: ["4639"],
  },
  categories: {
    airdrop: ["Airdrops"],
    noncirculating: ["Foundation & Reserve"],
    privateSale: ["Fundraising"],
    insiders: ["Core Contributors","Ecosystem & Development"],
  },
};

export default saga;
