import { Protocol } from "../types/adapters";
import { manualStep, manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 100e6;
const start = 1654732800; 

const aura: Protocol = {

    "Future incentives": manualStep(1671148800, periodToSeconds.day, 1, 1e6), 
    "Bootstrapping token holder base": manualStep(start, periodToSeconds.day, 1, 1e6),
    "LBP liquidity": manualStep(start, periodToSeconds.day, 1, 1.7e6),
    "veBAL bootstrapping incentives": manualStep(start, periodToSeconds.day, 1, 2e6),
    "AURA/ETH POL": manualStep(start, periodToSeconds.day, 1, 2e6),
    "BAL treasury": manualLinear(start, start + periodToSeconds.year * 2, 2e6),
    "auraBAL incentives": manualLinear(start, start + periodToSeconds.year * 4, 10e6),
    "Contributors": [
      manualLinear(start, start + periodToSeconds.year, 4.25e6),
      manualLinear(start + periodToSeconds.year, start + periodToSeconds.year * 3.5, 5.75e6)
    ],
    "Treasury": [
      manualStep(start, periodToSeconds.day, 1, 2.8e6),
      manualLinear(start, start + periodToSeconds.year * 4, 17.5e6)
    ],
    "Balancer LP rewards": [
      manualLinear(start, start + periodToSeconds.year, 13.5e6),
      manualLinear(start + periodToSeconds.year, start + periodToSeconds.year * 2, 9.5e6),
      manualLinear(start + periodToSeconds.year * 2, start + periodToSeconds.year * 4, 12e6),
      manualLinear(start + periodToSeconds.year * 4, start + periodToSeconds.year * 6, 10e6),
      manualLinear(start + periodToSeconds.year * 6, start + periodToSeconds.year * 7.5, 5e6)
    ],
  meta: {

    notes: [
      `The emission and distribution details are based on the proposed and intended token emission and distribution for Aura.`,
      `The exact details might vary based on real-time decisions and governance.`,
    ],
    sources: [
      "https://docs.aura.finance/aura/usdaura/distribution",
    ],
    token: "ethereum:0xc0c293ce456ff0ed870add98a0828dd4d2903dbf", 
    protocolIds: ["1918"], 
  },
  categories: {
    farming: ["auraBAL incentives", "Balancer LP rewards"],
    noncirculating: ["BAL treasury", "Treasury"],
    insiders: ["Contributors"],
    airdrop: ["AURA/ETH POL", "Bootstrapping token holder base", "LBP liquidity", "veBAL bootstrapping incentives", "Future incentives"]
  },
};

export default aura;
