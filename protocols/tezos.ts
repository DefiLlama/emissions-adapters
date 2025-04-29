import { manualCliff, manualStep, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const start = 1506902400;

const icoAllocation = 607_489_040;
const earlyBackersAllocation = 3_156_502;
const foundationAllocation = 76_330_692;
const dlsTeamAllocation = 76_330_692;
const initialSupply = icoAllocation + earlyBackersAllocation + foundationAllocation + dlsTeamAllocation;

const vestingYears = 4;
const vestingMonths = vestingYears * 12;
const foundationMonthlyVest = foundationAllocation / vestingMonths;
const dlsTeamMonthlyVest = dlsTeamAllocation / vestingMonths;

const annualInflationRate = 0.055; // ESTIMATED
const modelingDurationYears = 10;
const approxAnnualInflationAmount = initialSupply * annualInflationRate;
const approxTotalInflationAmount = approxAnnualInflationAmount * modelingDurationYears;
const inflationModelEndDate = start + periodToSeconds.years(modelingDurationYears);

const tezos: Protocol = {
  "ICO Participants": manualCliff(start, icoAllocation),
  "Early Backers": manualCliff(start, earlyBackersAllocation),
  "Tezos Foundation": manualStep(
    start + periodToSeconds.month,
    periodToSeconds.month,
    vestingMonths,
    foundationMonthlyVest
  ),
  "Dynamic Ledger Solutions (Team)": manualStep(
    start + periodToSeconds.month,
    periodToSeconds.month,       
    vestingMonths,
    dlsTeamMonthlyVest
  ),
  "Emissions (Approximation)": manualLinear(
    start,
    inflationModelEndDate,
    approxTotalInflationAmount
  ),

  meta: {
    notes: [
      "Tezos Foundation and DLS (Team) allocations vested monthly over 4 years.",
      "The 4-year vesting period for Foundation and Team concluded on September 17, 2022.",
      "Actual Tezos inflation is adaptive and changes based on the network staking ratio but for simplicity, we assume a constant rate of 5.5%.",
    ],
    sources: [
      "https://tezos.foundation/fundraiser-statistics/",
      "https://tezos.gitlab.io/alpha/adaptive_issuance.html",
      "https://icodrops.com/tezos/"
    ],
    token: "coingecko:tezos",
    protocolIds: ["6101"]
  },
  categories: {
    publicSale: ["ICO Participants"],
    insiders: ["Early Backers", "Dynamic Ledger Solutions (Team)"],
    noncirculating: ["Tezos Foundation"],
    farming: ["Emissions (Approximation)"]
  }
};

export default tezos;