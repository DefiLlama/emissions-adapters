import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1662508800;
const totalSupply = 1_000_000_000;

const community = totalSupply * 0.5;
const team = totalSupply * 0.3;
const foundation = totalSupply * 0.2;

const alexlab: Protocol = {
  "Employees, Advisors, Early Investors, Teams": manualCliff(
    start,
    team,
  ),
  "Foundation": manualCliff(
    start,
    foundation,
  ),
  "Community": [
    manualLinear(
      start,
      start + periodToSeconds.year,
      259_000_000,
    ),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(2),
      130_000_000,
    ),
    manualLinear(
      start + periodToSeconds.years(2),
      start + periodToSeconds.years(3),
      65_000_000,
    ),
    manualLinear(
      start + periodToSeconds.years(3),
      start + periodToSeconds.years(4),
      33_000_000,
    ),
    manualLinear(
      start + periodToSeconds.years(4),
      start + periodToSeconds.years(5),
      13_000_000,
    ),
  ],

  meta: {
    token: "coingecko:alexgo",
    sources: ["https://docs.alexlab.co/helpful-concepts/tokenomics"],
    protocolIds: ["1466"],
    notes: ["We categorized the 'Community' as farming because it's reserved for staking ALEX or Liquidity Tokens to earn ALEX"],
  },

  categories: {
    insiders: ["Employees, Advisors, Early Investors, Teams"],
    noncirculating: ["Foundation"],
    farming: ["Community"],
  }
};

export default alexlab;
