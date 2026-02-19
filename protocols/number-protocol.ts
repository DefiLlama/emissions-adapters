import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const start = 1637280000;
const mainnet = 1669852800;
const total_supply = 1_000_000_000;

const privateSaleAmount = total_supply * 0.1760; // Integrity reward
const publicSaleAmount = total_supply * 0.0300;
const teamAmount = total_supply * 0.1750;
const partnersAmount = total_supply * 0.0150;
const stakingAmount = total_supply * 0.2700; // User Reward and Staking
const liquidityAmount = total_supply * 0.1000;
const ecosystemAmount = total_supply * 0.2280;
const marketingAmount = total_supply * 0.0060;

const numProtocol: Protocol = {
    "Ecosystem": (() => {
        // Vesting: 1.5% on TGE, 2% monthly until all tokens are distributed.
        const tgeAmount = ecosystemAmount * 0.015;
        const remainingTotal = ecosystemAmount - tgeAmount; // 98.5%
        const monthlyAmount = ecosystemAmount * 0.02;
        const fullSteps = Math.floor(remainingTotal / monthlyAmount); // 0.985 / 0.02 = 49.25 -> 49 full steps
        const finalStepAmount = remainingTotal - fullSteps * monthlyAmount; // Amount for the last partial step
    
        const steps = [
            manualCliff(start, tgeAmount),
            manualStep(
                start + periodToSeconds.month, // Start first step 1 month after TGE
                periodToSeconds.month,
                fullSteps, // 49 full steps
                monthlyAmount
            )
        ];
    
        if (finalStepAmount > 1e-9) { // Add cliff for remaining dust if significant
            steps.push(
                manualCliff(
                    start + periodToSeconds.month * (fullSteps + 1), // Time of the 50th step
                    finalStepAmount
                )
            );
        }
        return steps;
      })(),

      "Liquidity": (()=>{
      // Vesting: 10% on TGE, 3% monthly for the first year, and 5.2% monthly for the second year.
      // NOTE: Source calculation (10% + 12*3% + 12*5.2% = 10% + 36% + 62.4% = 108.4%) exceeds 100%.
      // Assumption: Adjust monthly percentages proportionally to distribute the remaining 90% over 24 months.
      const tgeAmount = liquidityAmount * 0.10;
      const remainingAmount = liquidityAmount * 0.90;
      const weightY1 = 12 * 3; // 36
      const weightY2 = 12 * 5.2; // 62.4
      const totalWeight = weightY1 + weightY2; // 98.4
      const amountY1 = remainingAmount * (weightY1 / totalWeight); // 90% * (36 / 98.4)
      const amountY2 = remainingAmount * (weightY2 / totalWeight); // 90% * (62.4 / 98.4)
      const amountPerMonthY1 = amountY1 / 12;
      const amountPerMonthY2 = amountY2 / 12;

      return [
          manualCliff(start, tgeAmount),
          manualStep(
              start + periodToSeconds.month, // Start first step 1 month after TGE
              periodToSeconds.month,
              12, // 12 steps in year 1
              amountPerMonthY1
          ),
          manualStep(
              start + periodToSeconds.year + periodToSeconds.month, // Start first step of year 2 (month 13)
              periodToSeconds.month,
              12, // 12 steps in year 2
              amountPerMonthY2
          )
      ]
  })(),
  "User Reward and Staking": [
    // 1% monthly for the first year, 2% monthly starting from the second year until all tokens are distributed. Starts after network launch.
    // Phase 1: Year 1
    manualStep(
      mainnet,
      periodToSeconds.month,
      12, // First 12 months
      stakingAmount * 0.01 // 1% of total staking allocation per month
    ),
    // Phase 2: Year 2 onwards
    manualStep(
      mainnet + periodToSeconds.year, // Start of the second year
      periodToSeconds.month,
      Math.round((stakingAmount * 0.88) / (stakingAmount * 0.02)), // Steps for remaining 88% at 2% per step (88/2 = 44)
      stakingAmount * 0.02 // 2% of total staking allocation per month
    )
  ],
  "Pre-Listing Partners and Consultants": [
    // 10% on TGE, 6-month lock, 22.5% on month 7, 13, 16, 19.
    manualCliff(start, partnersAmount * 0.10),
    manualCliff(start + periodToSeconds.months(7), partnersAmount * 0.225),
    manualCliff(start + periodToSeconds.months(13), partnersAmount * 0.225),
    manualCliff(start + periodToSeconds.months(16), partnersAmount * 0.225),
    manualCliff(start + periodToSeconds.months(19), partnersAmount * 0.225)
  ],
  "Team and Advisors": [
    // 1-year cliff after TGE or 3-month cliff after network launch (the shorter), then 2.78% monthly.
    manualStep(
      start + periodToSeconds.year, // Start after 1 year cliff (assumed shortest)
      periodToSeconds.month, // Monthly steps
      Math.round(1 / 0.0278), // Approx 36 steps (100% / 2.78%)
      teamAmount / Math.round(1 / 0.0278) // Distribute total amount over calculated steps
    )
  ],
  "Private Sale": [
    // Integrity reward: 10% on TGE, 3-month lock, 4.29% monthly over 21 months.
    manualCliff(start, privateSaleAmount * 0.10),
    manualStep(
      start + periodToSeconds.months(3), // Start after 3 month lock
      periodToSeconds.month, // Monthly steps
      21, // 21 steps
      (privateSaleAmount * 0.90) / 21 // Remaining 90% distributed over 21 months
    )
  ],
  "Public Sale": [
    // 20% on TGE, 3-month lock, then 20% quarterly.
    manualCliff(start, publicSaleAmount * 0.20),
    manualStep(
      start + periodToSeconds.months(3), // Start after 3 month lock
      periodToSeconds.months(3), // Quarterly steps (3 months)
      4, // Remaining 80% released in 4 steps (80 / 20 = 4)
      publicSaleAmount * 0.20 // 20% of total public sale allocation per step
    )
  ],
 
  "Marketing": [
    // 17.5% on TGE, then 7.5% monthly.
    manualCliff(start, marketingAmount * 0.175),
    manualStep(
      start + periodToSeconds.month, // Start first step 1 month after TGE
      periodToSeconds.month,
      11, // Remaining 82.5% distributed in 11 steps (82.5 / 7.5 = 11)
      marketingAmount * 0.075 // 7.5% of total marketing allocation per step
    )
  ],
  
  
 

  meta: {
    notes: [
      "Team/Advisors vesting has a condition ('1-year cliff after TGE or 3-month cliff after network launch (the shorter)'). Network launch date is December 2022 which is 1 year and 1 month after TGE, so the 1-year cliff is used.",
      "User Reward/Staking distribution starts after network launch.",
    ],
    sources: ["https://www.numbersprotocol.io/blog/numbers-protocol-tokenomics-a-deep-dive-into-num-part-1", "https://docs.numbersprotocol.io/introduction"], // Add URL to tokenomics doc when available
    token: "coingecko:numbers-protocol",
    protocolIds: ["1041"],
  },
  categories: {
    privateSale: ["Private Sale"],
    publicSale: ["Public Sale"],
    insiders: ["Team and Advisors", "Pre-Listing Partners and Consultants"],
    staking: ["User Reward and Staking"],
    liquidity: ["Liquidity"],
    noncirculating: ["Ecosystem"],
  }
};

export default numProtocol;