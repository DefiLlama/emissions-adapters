import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1585699200; // Start date

// Token allocations
const communityGrants = 171_424_328;
const teamAdvisors = 193_716_690;
const preLaunchSales = 122_971_117;
const stakingValidatorReserve = 244_818_027;
const initialReserve = 120_000_000;

const celo: Protocol = {

  "Pre-launch Sales": [
    manualCliff(
      start,
      preLaunchSales * 0.1641
    ),

    manualStep(
      start + periodToSeconds.month,
      periodToSeconds.month,
      42, // 42 months
      (preLaunchSales - (preLaunchSales * 0.1641)) / 42
    )
  ],

  "Initial Reserve": [
    manualCliff(
      start,
      initialReserve * 0.5 // 50% at TGE
    ),
    manualCliff(
      1901145600, // March 31, 2030
      initialReserve * 0.5 // 50% at March 31, 2030 based on the spreadsheet
    )
  ],

  "Team, Advisors, Founders & Contributors":
    manualStep(
      start,
      periodToSeconds.month,
      60,
      teamAdvisors / 60
    ),

  "Community Grants": manualLinear(
    start,
    start + periodToSeconds.years(30),
    communityGrants
  ),

  "Staking & Validator Reserve": [
    // 833,333 CELO per month for 15 years
    manualStep(
      start,
      periodToSeconds.month,
      15 * 12, // 15 years of months
      833_333
    ),
    // Decreasing rate for the remaining amount over the next 15 years
    manualLinear(
      start + periodToSeconds.years(15),
      start + periodToSeconds.years(30),
      stakingValidatorReserve - (833_333 * 15 * 12)
    )
  ],

  "Operational Grants": [
    // First year (months 1-12): 312,500 CELO per month
    manualStep(
      start,
      periodToSeconds.month,
      12,
      312_500
    ),
    // Next 3 years (months 13-48): 1,060,199 CELO per month
    manualStep(
      start + periodToSeconds.years(1),
      periodToSeconds.month,
      36,
      1_060_199
    ),
    // Next 2 years (months 49-72): 851,866 CELO per month
    manualStep(
      start + periodToSeconds.years(4),
      periodToSeconds.month,
      24,
      851_866
    ),
    // Next 4 years (months 73-120): 208,333 CELO per month
    manualStep(
      start + periodToSeconds.years(6),
      periodToSeconds.month,
      48,
      208_333
    ),
    // Next 1 year (months 121-132): 104,167 CELO per month
    manualStep(
      start + periodToSeconds.years(10),
      periodToSeconds.month,
      12,
      104_167
    )
  ],

  meta: {
    token: "celo:0x471ece3750da237f93b8e339c536989b8978a438",
    sources: [
      "https://blog.celo.org/understanding-cgld-allocation-estimated-circulating-supply-over-time-f08a063a23ad",
      "https://docs.google.com/spreadsheets/d/1slQ5jzBwPhuneKm1TuwbG4EPdfpYVw62Hs9V6S479iA/"
    ],
    protocolIds: ["6041"],
    notes: [
      "Community Grants unlock monthly over 30 years with decreasing rate",
      "Team, Advisors, Founders & Contributors tokens vest monthly over 5 years",
      "Pre-launch Sales had 16.41% unlock at TGE and remainder vests monthly over 42 months",
      "Staking & Validator Reserve allocates 833,333 CELO monthly for 15 years, then decreasing rate for 15 years",
      "Initial Reserve had 50% unlock at TGE, with remaining 50% unlocking on March 31, 2030",
      "Operational Grants have multiple vesting phases with different amount and timeframes"
    ],
  },

  categories: {
    insiders: ["Team, Advisors, Founders & Contributors", "Pre-launch Sales"],
    farming: ["Staking & Validator Reserve"],
    noncirculating: ["Community Grants", "Initial Reserve", "Operational Grants"],
  },
};

export default celo;