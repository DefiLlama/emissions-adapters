import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const total = 1e9;
const start = 1707264000;

const dymension: Protocol = {
  "Genesis Rolldrop": manualCliff(start, total * 0.08),
  "Ecosystem & R&D": [
    manualCliff(start, (total * 0.2) / 3),
    manualLinear(start, start + periodToSeconds.years(3), (total * 0.4) / 3),
  ],
  "Incentives Manager": manualLinear(
    start,
    start + periodToSeconds.years(5),
    total / 3,
  ),
  "Community Pool": manualLinear(
    start,
    start + periodToSeconds.years(5),
    total * 0.05,
  ),
  Backers: manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.14,
  ),
  "Core Contributors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.2,
  ),
  Inflation: manualLinear(start, start + periodToSeconds.years(5), 276281562), // 5% inflation per year
  meta: {
    notes: [
      "Infaltion is dynamic and between 2% and 8% per year. Here we have used an approximate of 5%.",
      "Unvested DYM is eligible for staking",
      "The Incentives Manager and Community Pool allocations are available at genesis. Dymension indicates that they will be spent over 5 years. This is the time period used in this analysis.",
    ],
    sources: ["https://docs.dymension.xyz/learn/dymension/dym/distribution"],
    token: "coingecko:dymension",
    protocolIds: ["4490"],
    total,
  },
  categories: {
    airdrop: ["Genesis Rolldrop"],
    farming: ["Incentives Manager"],
    noncirculating: ["Community Pool","Ecosystem & R&D"],
    privateSale: ["Backers"],
    insiders: ["Core Contributors"],
  },
};
export default dymension;
