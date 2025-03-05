import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1732838400;
const total = 1e9;

const hyperliquid: Protocol = {
  "Hyper Foundation Budget": manualCliff(start, total * 0.06),
  "Community Grants": manualCliff(start, total * 0.003),
  "HIP-2": manualCliff(start, total * 0.00012),
  "Genesis Distribution": manualCliff(start, total * 0.31),
  "Core Contributors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.238,
  ),
  "Community Rewards": manualLinear(
    start,
    start + periodToSeconds.days(3581), // start + periodToSeconds.days(35808.5),
    total * 0.03889, // total * 0.38888,
  ),
  meta: {
    notes: [
      "The Community Rewards schedule has been linearly extrapolated using the rate of unlocks as of 4 March 2025.",
      "The remaining allocation, not shown on the chart, belongs to Community Rewards. It has been excluded here to avoid obscuring the remaining data.",
      "Most vesting schedules will complete between 2027–2028; some will continue after 2028. Here we have used an end date of end of 2027.",
      "Although the full allocations for Hyper Foundation Budget and Community Grants were unlocked at TGE it is unclear what their spend rate is.",
    ],
    token: "coingecko:hyperliquid",
    sources: ["https://hyperfnd.medium.com/hype-genesis-1830a4dc2e3f"],
    protocolIds: ["4481", "5448", "5507", "5761"],
    total,
  },
  categories: {
    insiders: ["Core Contributors", "Hyper Foundation Budget"],
    noncirculating: ["Community Grants"],
    publicSale: ["HIP-2"],
    airdrop: ["Genesis Distribution"],
    farming: ["Community Rewards"],
  },
};
export default hyperliquid;
