import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1712876400;
const total = 21e9;

const bouncebit: Protocol = {
  "Testnet & TVL Incentives": manualCliff(start, total * 0.04),
  Investors: manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    20,
    (total * 0.21) / 20,
  ),
  Team: manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    40,
    (total * 0.1) / 40,
  ),
  Advisors: manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    40,
    (total * 0.05) / 40,
  ),
  "Binance Megadrop": manualCliff(start, total * 0.08),
  "Market Making": manualCliff(start, total * 0.03),
  "BounceClub & Ecosystem Reserve": [
    manualCliff(start, total * 0.045),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      20,
      (total * 0.095) / 20,
    ),
  ],
  "Staking Reward & Delegation Program": manualLinear(
    start,
    start + periodToSeconds.years(10),
    total * 0.35,
  ),
  meta: {
    sources: ["https://docs.bouncebit.io/token/bouncebit-tokenomics/bb-coin"],
    token: "coingecko:bouncebit",
    notes: [
      `No unlock schedule was given for Staking Reward & Delegation Program so we've assumed a linear schedule in this analysis.`,
    ],
    protocolIds: ["4656"],
  },
  categories: {
    farming: [
      "Testnet & TVL Incentives",
      "Staking Reward & Delegation Program",
    ],
    insiders: ["Investors", "Team", "Advisors"],
    airdrop: ["Binance Megadrop"],
    publicSale: ["Market Making"],
    noncirculating: ["BounceClub & Ecosystem Reserve"],
  },
};
export default bouncebit;
