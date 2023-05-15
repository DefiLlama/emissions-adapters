import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import vesting from "../adapters/uniswap/uniswap";

const qty = 1000000000;
const start = 1638316800;

const silo: Protocol = {
  "Genesis protocol-owned liquidity": manualCliff(start, qty * 0.1),
  "Community treasury": manualLinear(
    start,
    start + periodToSeconds.year * 3,
    qty * 0.45,
  ),
  "Early contributors": [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.0675 / 8),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year * 4,
      qty * 0.0675 * 7 / 8,
    ),
  ],
  "Founding contributors": [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.2175 / 6),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year * 3,
      qty * 0.2175 * 5 / 6,
    ),
  ],
  "Early community rewards": manualCliff("2022-01-01", qty * 0.002),
  "Early investors & early advisors": manualLinear(
    start + periodToSeconds.year * 0.5,
    start + periodToSeconds.year * 2.5,
    qty * 0.063,
  ),
  "Future contributors & future advisors": vesting(
    "0x6e5C8274012d9cb386EF8Dcc71a461B71BD07831",
    "ethereum",
    "silo",
  ),
  meta: {
    sources: [
      "https://silopedia.silo.finance/governance/token-allocation-and-vesting",
    ],
    notes: [
      `Future contributors and advisors (10%) are distributed to the DAO on a linear unlock, and then individuals have a further vesting schedule depending on when they join the DAO. Only the initial vesting schedule has been described in this analysis.`,
    ],
    token: "ethereum:0x6f80310ca7f2c654691d1383149fa1a57d8ab1f8",
    protocolIds: ["2020"],
  },
  sections: {
    publicSale: ["Genesis protocol-owned liquidity"],
    noncirculating: ["Community treasury"],
    insiders: [
      "Early contributors",
      "Founding contributors",
      "Early investors & early advisors",
      "Future contributors & future advisors",
    ],
    airdrop: ["Early community rewards"],
  },
};

export default silo;
