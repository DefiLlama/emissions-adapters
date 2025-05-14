import { Protocol } from "../types/adapters";
import { manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1743638400;
const totalSupply = 1_000_000_000;

const investor = totalSupply * 0.215;
const foundation = totalSupply * 0.1865;
const community = totalSupply * 0.1787;
const team = totalSupply * 0.15;
const marketing = totalSupply * 0.0913;
const airdropIncentives = totalSupply * 0.0785;
const liquidity = totalSupply * 0.06
const ecosystem = totalSupply * 0.04

const stakestone: Protocol = {
  "Marketing & Partnerships": manualCliff(
    start,
    marketing,
  ),
  "Airdrop & Future Incentives": manualCliff(
    start,
    airdropIncentives,
  ),
  "Liquidity": manualCliff(
    start,
    liquidity,
  ),
  "Investor": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    24,
    investor / 24,
  ),
  "Foundation": [
    manualCliff(
      start + periodToSeconds.months(6),
      foundation * 0.111
    ),
    manualStep(
      start + periodToSeconds.months(6),
      periodToSeconds.month,
      48,
      (foundation * 0.889) / 48,
    )
  ],
  "Team": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    36,
    team / 36,
  ),
  "Ecosystem & Treasury": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    36,
    ecosystem / 36,
  ),
  "Community": manualStep(
    start,
    periodToSeconds.month,
    60,
    community / 60,
  ),

  meta: {
    token: "coingecko:stakestone",
    sources: ["https://docs.stakestone.io/stakestone/governance/tokenomics"],
    protocolIds: ["parent#stakestone"],
    notes: ["Unlock schedule is based on the chart provided in the Stakestone documentation."],
  },

  categories: {
    privateSale: ["Investor"],
    liquidity: ["Liquidity"],
    noncirculating: ["Foundation", "Ecosystem & Treasury", "Marketing & Partnerships", "Community"],
    farming: ["Airdrop & Future Incentives"],
    insiders: ["Team"],
  }
};

export default stakestone;
