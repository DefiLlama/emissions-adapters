import { manualLinear, manualCliff } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const totalSupply = 300_000_000; // Total supply of PRISMA tokens
const start = 1693353600; // Start date in Unix timestamp format

// High Emission Period
const highEmissionWeeks = 4;
const highEmissionAmount = 2_250_000 * highEmissionWeeks; // 9,000,000 total for weeks 1-4

// Fixed Allocations
const coreContributorsAmount = totalSupply * 0.20; // 60,000,000
const earlySupportersAmount = totalSupply * 0.10; // 30,000,000
const daoTreasuryAmount = totalSupply * 0.05; // 15,000,000
const veCRVAndPrismaPointsAmount = totalSupply * 0.03; // 9,000,000

// Remaining Supply for Post High Emission Period
let remainingEmissionSupply = totalSupply * 0.62 - highEmissionAmount; // 62% for emissions minus high emission amount

// Post High Emission Tranches
const postHighEmissionTranches = [
    { percent: 8.4, weeks: 8 },
    { percent: 12.0, weeks: 12 },
    { percent: 10.8, weeks: 12 },
    { percent: 9.6, weeks: 12 },
    { percent: 36.4, weeks: 52 }, // Year 1-2
    { percent: 31.2, weeks: 52 }, // Year 2-3
    { percent: 31.2, weeks: 52 }  // Year 3+
];

let currentStart = start + highEmissionWeeks * periodToSeconds.week;
const postHighEmission = postHighEmissionTranches.map(tranche => {
    const trancheAmount = remainingEmissionSupply * (tranche.percent / 100);
    const trancheStart = currentStart;
    const trancheEnd = trancheStart + tranche.weeks * periodToSeconds.week;
    
    remainingEmissionSupply -= trancheAmount;
    currentStart = trancheEnd;

    return manualLinear(trancheStart, trancheEnd, trancheAmount);
});

const prisma: Protocol = {
    "DAO Treasury": manualCliff(start, daoTreasuryAmount),
    "veCRV and Prisma Points": manualCliff(start, veCRVAndPrismaPointsAmount),
    "High Emission Period": manualLinear(start, start + highEmissionWeeks * periodToSeconds.week, highEmissionAmount),
    "Core Contributors": manualLinear(start, start + periodToSeconds.month * 12, coreContributorsAmount),
    "Early Supporters": manualLinear(start, start + periodToSeconds.month * 12, earlySupportersAmount),
    "Post High Emission": postHighEmission,

  meta: {

    notes: [
        `The emission and distribution details are based on the proposed and intended token emission and distribution for Prisma.`,
        `The exact details might vary based on real-time decisions and governance.`,
        `Chart represents unlocks in the first 4 years where majority of tokens will be unlocked, Post High Emissions phase was calculated based on the maximum amount claimable as shown in the table here: https://docs.prismafinance.com/governance/the-prisma-token#incentive-distribution-schedule, the actual claims will be somewhere between 50-100% of these numbers, and anything unclaimed due to this is returned to the unallocated supply` 
    ],
    token: "ethereum:0xda47862a83dac0c112ba89c6abc2159b95afd71c",
    sources: [
      "https://docs.prismafinance.com/governance/the-prisma-token",
    ],
    protocolIds: ["3473"],
  },
  categories: {
    farming: ["High Emission Period","veCRV and Prisma Points", "Post High Emission",],
    insiders: ["Core Contributors", "Early Supporters"],
    noncirculating: ["DAO Treasury"],
  },
};

export default prisma;
