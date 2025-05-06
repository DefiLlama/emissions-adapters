import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const start = 1683763200;

const ggpStakingRewardsAmount = 3_375_000;
const originalTeamAmount = 4_500_000;
const advisorsAmount = 675_000;
const seedRoundAmount = 3_505_500;
const preIdoPartnerSaleAmount = 675_000;
const idoAmount = 225_000;
const goGoPoolFoundationAmount = 9_319_500;
const liquidityAmount = 225_000;

const gogopool: Protocol = {
   "Liquidity": manualCliff(start, liquidityAmount),
   "IDO": manualCliff(start, idoAmount),

  "GGP Staking Rewards": manualStep(
    start,
    periodToSeconds.month, 
    48, 
    ggpStakingRewardsAmount / 48, 
  ),
  "Original Team": manualStep(
    start + periodToSeconds.year + periodToSeconds.months(3),
    periodToSeconds.months(3), 
    12, 
    originalTeamAmount / 12, 
  ),
  "Advisors": manualStep(
    start + periodToSeconds.year + periodToSeconds.months(3),
    periodToSeconds.months(3), 
    12, 
    advisorsAmount / 12, 
  ),
  "Seed Round": manualStep(
    start + periodToSeconds.year + periodToSeconds.months(3),
    periodToSeconds.months(3), 
    12, 
    seedRoundAmount / 12, 
  ),
  "Pre-IDO Partner Sale": manualStep(
    start + periodToSeconds.year + periodToSeconds.months(3),
    periodToSeconds.months(3), 
    12, 
    preIdoPartnerSaleAmount / 12, 
  ),
  "GoGoPool Foundation": manualLinear(
    start + periodToSeconds.months(3), 
    start + periodToSeconds.months(3) + periodToSeconds.months(48), 
    goGoPoolFoundationAmount, 
  ),

  meta: {
    notes: [
      "The Pre-IDO Partner Sale description mentions different schedules based on ticket size (<100k USD vs >100k USD). However for simplification we have assumed it will all be locked for the first 12 month and unlocked quarterly over 36 months.",
      "The GoGoPool Foundation allocation is locked for 3 months and then released over 48 months subject to DAO votes. A linear release over the 48 months has been assumed for simplification.",
    ],
    sources: [
      "https://docs.gogopool.com/protocol/tokenomics",
    ],
    token: "coingecko:gogopool",
    protocolIds: ["3179"],
  },
  categories: {
    farming: ["GGP Staking Rewards"],
    insiders: ["Original Team", "Advisors"],
    privateSale: ["Seed Round", "Pre-IDO Partner Sale"],
    publicSale: ["IDO"],
    noncirculating: ["GoGoPool Foundation"],
    liquidity: ["Liquidity"],
  },
};

export default gogopool;