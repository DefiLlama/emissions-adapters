import { Protocol } from "../types/adapters";
import { manualStep, manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds, unixTimestampNow } from "../utils/time";

const qty = 1_000_000_000;
const start = 1639785600; // Dec 18, 2021 (genesis)

// Inflation modeling
const pbrSplitDate = 1737504000
const today = unixTimestampNow()
const annualStaking = 25_000_000
const annualCollator = 10_000_000
const annualPBR = 15_000_000
const preChangeYears = (pbrSplitDate - start) / periodToSeconds.year;
const postChangeYears = (today - pbrSplitDate) / periodToSeconds.year;
const inflationYears = (today - start) / periodToSeconds.year;

const moonbeam: Protocol = {
  "Seed funding": manualStep(
    1600815600 + periodToSeconds.month * 3,
    periodToSeconds.month,
    21,
    (qty * 0.14) / 21,
  ),
  "Strategic funding": manualStep(
    1617058800,
    periodToSeconds.month,
    10,
    (qty * 0.12) / 10,
  ),
  "Take Flight community event": manualCliff(1631023200, 98211164),
  "2021 Moonbeam crowdloan": [
    manualCliff(start, qty * 0.15 * 0.3),
    manualLinear(start, start + periodToSeconds.week * 96, qty * 0.15 * 0.7),
  ],
  "Parachain Bond Funding": manualCliff(start, 30_000_000),
  "Parachain Bond Reserve": manualCliff(start, 5_000_000),
  "Long-term Protocol & Ecosystem Development": manualCliff(
    start,
    166_770_536,
  ),
  Treasury: manualCliff(start, 5_000_000),
  "Liquidity programs": [
    manualLinear(1648767600, 1664578800, qty * 0.015),
    manualCliff(start, qty * 0.035),
  ],
  "Developer adoption program": manualStep(
    start,
    periodToSeconds.month,
    24,
    35_550_000 / 24,
  ),
  "Key partners and advisors": [
    manualStep(
      start + periodToSeconds.month * 7,
      periodToSeconds.month,
      17,
      39468300 / (3 * 17),
    ),
    manualStep(
      start + periodToSeconds.month * 2,
      periodToSeconds.month,
      10,
      39468300 / (3 * 10),
    ),
    manualStep(
      start + periodToSeconds.month * 3,
      periodToSeconds.month,
      21,
      39468300 / (3 * 21),
    ),
  ],
  "PureStake early backers": manualStep(
    start + periodToSeconds.month * 7,
    periodToSeconds.month,
    17,
    (qty * 0.014) / 17,
  ),
  "Founders and early employees": [
    manualCliff(start + periodToSeconds.year, qty * 0.025),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      36,
      (qty * 0.075) / 36,
    ),
  ],
  "Future employee incentives": [
    manualCliff(start + periodToSeconds.year, (qty * 0.046) / 4),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      36,
      (qty * 0.046 * 3) / (36 * 4),
    ),
  ],

  // inflation
  "Staking Rewards": manualLinear(start, today, annualStaking * inflationYears),
  "Collator Incentives": manualLinear(start, today, annualCollator * inflationYears),
  "Parachain Bond Reserve Inflation": [
    manualLinear(start, pbrSplitDate, annualPBR * preChangeYears),
    manualLinear(
      pbrSplitDate,
      today,
      annualPBR * 0.2 * postChangeYears,
    ),
  ],
  "Treasury Inflation": manualLinear(
    pbrSplitDate,
    today,
    annualPBR * 0.8 * postChangeYears,
  ),

  meta: {
    notes: [
      `Moonbeam genesis supply is 1B GLMR.`,
      `Parachain Bond Funding (3%), Parachain Bond Reserve (0.5%), Long-term Protocol & Ecosystem Development (16.7%), and Treasury (0.5%) are Foundation-controlled with no defined vesting schedule. Modeled as genesis cliffs in the noncirculating category.`,
      `Remaining Liquidity Programs (~3.5%) beyond the Harvest Moon program had no published schedule. Modeled as a genesis cliff.`,
      `Ongoing inflation targets 5% annually: 2.5% staking rewards, 1% collator incentives, 1.5% parachain bond reserve. Modeled from genesis up to the current date.`,
      `On Jan 22, 2025, 80% of the PBR inflation was redirected to Treasury. The model splits PBR inflation into pre and post-2025 periods.`,
      `On Mar 13, 2025, fee policy changed to 100% burn (previously 80% burn + 20% treasury). Fee burns are not modeled as they are demand-dependent.`,
    ],
    sources: [
      "https://moonbeam.foundation/glimmer-token/",
      "https://medium.com/moonbeam-network/moonbeams-2025-tokenomics-update-new-fee-burn-model-and-treasury-changes-explained-76048be9f296",
    ],
    token: "coingecko:moonbeam",
    protocolIds: ["2788"],
  },
  categories: {
    publicSale: ["Take Flight community event", "2021 Moonbeam crowdloan"],
    farming: ["Liquidity programs", "Long-term Protocol & Ecosystem Development"],
    privateSale: [
      "Seed funding",
      "Strategic funding",
      "PureStake early backers",
    ],
    insiders: [
      "Key partners and advisors",
      "Founders and early employees",
      "Future employee incentives",
      "Developer adoption program",
    ],
    noncirculating: [
      "Parachain Bond Funding",
      "Parachain Bond Reserve",
      "Treasury",
      "Treasury Inflation",
      "Parachain Bond Reserve Inflation",
    ],
    staking: ["Staking Rewards", "Collator Incentives"],
  },
};

export default moonbeam;
