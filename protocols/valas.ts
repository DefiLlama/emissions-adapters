import { Protocol, StepAdapterResult } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1648684800;
const totalSupply = 3_000_000_000;

const team = totalSupply * 0.2;
const treasury = totalSupply * 0.08;
const airdrop = totalSupply * 0.02;

const emissions = (
  baseStartTimestamp: number,
  splitRatio: number,
  months: number,
): StepAdapterResult[] => {
  const results: StepAdapterResult[] = [];
  const baseTotalMonthlyEmission = 175_000_000;
  const decayFactorBase = 1.0904;

  for (let n = 0; n < months; n++) {
    const totalEmissionForThisMonthN = baseTotalMonthlyEmission / Math.pow(decayFactorBase, n);
    const amountForThisStep = Math.round(totalEmissionForThisMonthN * splitRatio);
    if (amountForThisStep > 0) {
      results.push(
        manualStep(
          baseStartTimestamp + periodToSeconds.months(n),
          periodToSeconds.month,
          1,
          amountForThisStep
        )
      );
    }
  }
  return results;
};

const valas: Protocol = {
  "Treasury": manualCliff(
      start,
      treasury,
    ),
  "Airdrop": manualCliff(
    start,
    airdrop,
  ),
  "Team": manualLinear(
    start,
    start + periodToSeconds.year,
    team,
  ),
  "Lender & Borrower Incentives": emissions(start, 0.71, 60),
  "VALAS/BNB Incentives": emissions(start, 0.29, 60),

  meta: {
    token: "bsc:0xB1EbdD56729940089Ecc3aD0BBEEB12b6842ea6F",
    sources: ["https://medium.com/@valasfinance/introducing-valas-7f845185f68b", "https://docs.valasfinance.com/valas-token"],
    protocolIds: ["1584"],
    notes: ["The monthly emission of incentives follows the formula (175,000,000 / 1.0904^n), where n is the month number starting from TGE. The split ratio of 71% for Lender & Borrower Incentives and 29% for VALAS/BNB Incentives is based on the total monthly emission.", "Release schedule for treasury and airdrops is not specified, so we assume they are unlocked at TGE.", "The team allocation has a 1-year cliff and then linear vesting over 4 years."],
  },

  categories: {
    insiders: ["Team"],
    farming: ["Lender & Borrower Incentives", "VALAS/BNB Incentives"],
    noncirculating: ["Treasury"],
    airdrop: ["Airdrop"],
  }
};

export default valas;
