import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const start = 1724630400; //based on airdrop claim date
const totalSupply = 1_000_000_000;

const retroAirdropAmount = totalSupply * 0.133; // 133,000,000
const tradingRewardsTotalAmount = totalSupply * 0.15; // 150,000,000
const mmRewardsAmount = totalSupply * 0.10; // 100,000,000
const builderRewardsAmount = totalSupply * 0.0835; // 83,500,000
const futureProductAmount = totalSupply * 0.0835; // 83,500,000
const strategicInvestorsAmount = totalSupply * 0.15; // 150,000,000
const teamAdvisorsAmount = totalSupply * 0.20; // 200,000,000
const foundationAmount = totalSupply * 0.10; // 100,000,000

const foundationLiquidityAmount = 38_500_000;
const foundationMarketingAmount = 12_575_000;
const foundationReserveAmount = foundationAmount - foundationLiquidityAmount - foundationMarketingAmount; // 48,925,000 (Reserved)

const epochDuration = periodToSeconds.day * 14;
const totalEpochs = 200;

// Trading Rewards Epoch Calculation
const tradingEpochs1_2_Amount = 1_500_000;
const tradingEpochs3_4_Amount = 1_400_000;
const tradingEpochs5_6_Amount = 1_300_000;
const tradingEpochs7_8_Amount = 1_200_000;
const tradingEpochs9_10_Amount = 1_100_000;
const tradingEpochs11_20_Amount = 1_000_000;

const tradingRewardsEpoch1_20_Total =
  tradingEpochs1_2_Amount * 2 +
  tradingEpochs3_4_Amount * 2 +
  tradingEpochs5_6_Amount * 2 +
  tradingEpochs7_8_Amount * 2 +
  tradingEpochs9_10_Amount * 2 +
  tradingEpochs11_20_Amount * 10; // 23,000,000

const tradingRewardsRemainingAmount = tradingRewardsTotalAmount - tradingRewardsEpoch1_20_Total; // 127,000,000

const orderlyNetwork: Protocol = {
  "Retroactive Airdrop": manualCliff(start, retroAirdropAmount),
  "Liquidity": manualCliff(
    start,
    foundationLiquidityAmount,
  ),
  "Foundation": [
    manualCliff(
      start,
      foundationReserveAmount + futureProductAmount,
    ),
    manualLinear(
      start,
      start + periodToSeconds.year * 2, 
      foundationMarketingAmount,
    ),
  ],

  "Strategic Investors": manualLinear(
    start + periodToSeconds.months(6), 
    start + periodToSeconds.months(6) + periodToSeconds.year * 3.5, 
    strategicInvestorsAmount,
  ),
  "Team and Advisors": [
    manualCliff(
      start + periodToSeconds.year, 
      teamAdvisorsAmount * 0.25, 
    ),
    manualLinear(
      start + periodToSeconds.year, 
      start + periodToSeconds.year * 4,
      teamAdvisorsAmount * 0.75,
    ),
  ],

  "Trading Rewards": [
    manualStep(start, epochDuration, 2, tradingEpochs1_2_Amount),
    manualStep(start + epochDuration * 2, epochDuration, 2, tradingEpochs3_4_Amount),
    manualStep(start + epochDuration * 4, epochDuration, 2, tradingEpochs5_6_Amount),
    manualStep(start + epochDuration * 6, epochDuration, 2, tradingEpochs7_8_Amount),
    manualStep(start + epochDuration * 8, epochDuration, 2, tradingEpochs9_10_Amount),
    manualStep(start + epochDuration * 10, epochDuration, 10, tradingEpochs11_20_Amount),
    manualLinear(
      start + epochDuration * 20,
      start + epochDuration * totalEpochs,
      tradingRewardsRemainingAmount // 127,000,000
    ),
  ],

  "Market Making Rewards": manualStep(
    start,
    epochDuration,
    totalEpochs + 1,
    mmRewardsAmount / totalEpochs,
  ),
  "Builder Rewards": manualLinear(
    start,
    start + periodToSeconds.years(4),
    builderRewardsAmount,
  ),
  

  meta: {
    notes: [
      "Trading Rewards: Epochs 1-20 are modeled to be unlocked biweekly based on the specific amounts per epoch provided in the documentation.",
      "Trading Rewards: Epochs 21-200 (127M tokens over 180 epochs) are modeled linearly for simplicity in reality it will depends on the allocation mechanism.",
      "Market Making Rewards are modeled linearly over 200 eopchs for simplicity in reality it wil depends on the allocation mechanism.",
      "Rewards switch from $ORDER to esORDER starting from epoch 7. This schedule models the emission of the total value, regardless of the specific token variant.",
      "Builder Rewards (8.35%) are released via grants based on criteria. We model it as unlocked over 4 years.",
      "Foundation Marketing Partnerships (1.2575%) are stated to span 2 years, we assumed linear release over this period starting from TGE.",
      "Future Product Launches and Foundation Reserve allocation are stated as unlocked in the future, we model them as unlocked at TGE.",
    ],
    sources: ["https://orderly.network/docs/introduction/tokenomics/distribution-and-emission-schedule","https://docs.orderly.network/introduction/tokenomics/trading-rewards/trading-rewards-mechanism"],
    token: "ethereum:0xABD4C63d2616A5201454168269031355f4764337",
    protocolIds: ["parent#orderly-network"],
  },
  categories: {
    airdrop: ["Retroactive Airdrop"],
    farming: ["Trading Rewards","Market Making Rewards"],
    liquidity: ["Liquidity"],
    noncirculating: ["Builder Rewards","Foundation"],
    privateSale: ["Strategic Investors"],
    insiders: ["Team and Advisors"],
  },
};

export default orderlyNetwork;