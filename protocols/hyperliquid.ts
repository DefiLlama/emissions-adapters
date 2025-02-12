import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1732838400;
const total = 1e9;

const hyperliquid: Protocol = {
  "Community Rewards": manualLinear(
    start,
    start + periodToSeconds.years(3),
    total * 0.38888,
  ),
  "Genesis Distribution": manualCliff(start, total * 0.31),
  "Core Contributors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.238,
  ),

  "Hyper Foundation Budget": manualLinear(
    start,
    start + periodToSeconds.years(3),
    total * 0.06,
  ),
  "Community Grants": manualLinear(
    start,
    start + periodToSeconds.years(3),
    total * 0.003,
  ),
  "HIP-2": manualCliff(start, total * 0.00012),
  meta: {
    notes: [
      "Most vesting schedules will complete between 2027–2028; some will continue after 2028. Here we have used an end date of end of 2027.",
      "No information could be found regarding the unlock schedules of Community Rewards, Hyper Foundation Budget and Community Grants (44% of total). Her we have assumed a 3 year linear spend rate.",
    ],
    token: "coingecko:hyperliquid",
    sources: ["https://hyperfnd.medium.com/hype-genesis-1830a4dc2e3f"],
    protocolIds: ["4481", "5448", "5507", "5761"],
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
