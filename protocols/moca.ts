import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1720656000; // July 11, 2024
const totalSupply = 8_888_888_888;

// Allocation amounts
const strategicPartners = totalSupply * 0.13;
const ecosystemTreasury = totalSupply * 0.20;
const team = totalSupply * 0.12;
const liquidity = totalSupply * 0.10;
const operationalExpenses = totalSupply * 0.05;
const networkIncentives = totalSupply * 0.315;
const launchContributors = totalSupply * 0.07;
const communitySale = totalSupply * 0.015;

const moca: Protocol = {
  "Liquidity": [
    manualCliff(start, liquidity * 0.50), // 50% at TGE
    manualLinear(
      start,
      start + periodToSeconds.months(12), // 12 month vesting
      liquidity * 0.50 // Remaining 50%
    )
  ],

  "Network Incentives": [
    manualCliff(start, networkIncentives * 0.20), // 20% at TGE
    manualLinear(
      start,
      start + periodToSeconds.months(24), // 24 month vesting
      networkIncentives * 0.80 // Remaining 80%
    )
  ],

  "Operational Expenses": [
    manualCliff(start, operationalExpenses * 0.20), // 20% at TGE
    manualLinear(
      start,
      start + periodToSeconds.months(24), // 24 month vesting
      operationalExpenses * 0.80 // Remaining 80%
    )
  ],
  
  "Ecosystem & Treasury": [
    manualCliff(start, ecosystemTreasury * 0.10), // 10% at TGE
    manualLinear(
      start,
      start + periodToSeconds.months(48), // 48 month vesting
      ecosystemTreasury * 0.90 // Remaining 90%
    )
  ],

  "Community Sale": [
    manualCliff(start, communitySale * 0.05), // 5% at TGE
    manualLinear(
      start + periodToSeconds.months(3), // 3 month cliff
      start + periodToSeconds.months(15), // 12 months vesting
      communitySale * 0.95 // Remaining 95%
    )
  ],

  "Team": manualLinear(
    start + periodToSeconds.months(18), // 18 month cliff
    start + periodToSeconds.months(48), // 30 month vesting
    team
  ),

 
  "Strategic Partners": manualLinear(
    start + periodToSeconds.months(12), // 12 month cliff
    start + periodToSeconds.months(30), // 18 month vesting
    strategicPartners
  ),
 

  "Launch Contributors & Advisors": manualLinear(
    start + periodToSeconds.months(18), // 18 month cliff
    start + periodToSeconds.months(36), // 18 month vesting
    launchContributors
  ),

  meta: {
    token: "ethereum:0xF944e35f95E819E752f3cCB5Faf40957d311e8c5",
    sources: ["https://moca.foundation/moca-coin"],
    protocolIds: ["6027"],
  },
  
  categories: {
    insiders: [
      "Strategic Partners",
      "Team",
      "Launch Contributors & Advisors"
    ],
    publicSale: ["Community Sale"],
    noncirculating: [
      "Ecosystem & Treasury",
      "Operational Expenses"
    ],
    farming: ["Network Incentives"],
    liquidity: ["Liquidity"],
    airdrop: []
  },
};

export default moca;
