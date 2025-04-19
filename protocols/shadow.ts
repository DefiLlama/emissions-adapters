import { manualCliff, manualLinear } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1736899200; 
const total = 10_000_000;

const emissions = (percentage: number): LinearAdapterResult[] => {
  const result: LinearAdapterResult[] = [];
  let weeklyEmissionRate = 50_000; // starting emission rate (50k SHADOW per week)
  let weekNumber = 0;
  let totalEmitted = 3_000_000;

  // Note: Elastic emissions (±25% multiplier change) are not modeled here.
  // This function models the base decay schedule assuming a constant 1% decay (multiplier=9900).
  while (totalEmitted < total) {
    let currentWeekEmissionAmount = (weeklyEmissionRate * percentage) / 100;
    let isFinalEmission = false;

    if (totalEmitted + currentWeekEmissionAmount > total) {
      currentWeekEmissionAmount = (total - totalEmitted);
      currentWeekEmissionAmount = (currentWeekEmissionAmount * percentage) / 100;

      isFinalEmission = true;
    }

    result.push({
      type: "linear",
      start: start + periodToSeconds.weeks(weekNumber),
      end: start + periodToSeconds.weeks(weekNumber + 1),
      amount: currentWeekEmissionAmount
    });

    totalEmitted += currentWeekEmissionAmount;

    if (isFinalEmission) {
      break;
    }

    weeklyEmissionRate *= 0.99; // apply 1% decay for the next period's calculation base

    weekNumber++;
    if (weeklyEmissionRate < 1) break;
  }

  return result;
}

const shadow: Protocol = {
  // Direct SHADOW allocations (no vesting)
  "Protocol-Owned Liquidity": manualCliff(start, total * 0.03),  // 300,000
  "Reserves": manualCliff(start, total * 0.045),         // 450,000

  // xSHADOW allocations (with 180-day vesting)
  "Contributors": manualLinear(
    start,
    start + periodToSeconds.days(180),
    total * 0.075,
  ),
  "Presales": manualLinear(
    start,
    start + periodToSeconds.days(180),
    total * 0.075,
  ),
  "Airdrop": manualLinear(
    start,
    start + periodToSeconds.days(180),
    total * 0.03,
  ),
  "Partners": manualLinear(
    start,
    start + periodToSeconds.days(180),
    total * 0.03,
  ),
  "Community Incentives": manualLinear(
    start,
    start + periodToSeconds.days(180),
    total * 0.015,
  ),

  // Emissions (remaining 7M)
  "Gauge Emissions": emissions(100),

  meta: {
    notes: [
      "We assume the initial allocations are linearly vested over 180 days.",
      "All allocations except Protocol-Owned Liquidity and Reserves are locked in xSHADOW.",
      "The emissions are elastic and depend on the protocol's revenue, which is not modeled here.",
    ],
    token: `sonic:0x3333b97138d4b086720b5ae8a7844b1345a33333`,
    sources: [
      "https://docs.shadow.so/pages/tokenomics",
      "https://docs.shadow.so/pages/xshadow",
      "https://sonicscan.org/tx/0xdbd2344dfd88f549599bb17a01e86263592da6c034d4a8541d824832ba375d86"
    ],
    protocolIds: ["parent#shadow-exchange"]
  },
  categories: {
    insiders: ["Contributors", "Partners"],
    publicSale: ["Presales"],
    airdrop: ["Airdrop"],
    noncirculating: ["Reserves"],
    farming: ["Gauge Emissions"],
    liquidity: ["Protocol-Owned Liquidity"]
  }
};

export default shadow;
