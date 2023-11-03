import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 1_000_000_000;
const start = 1645056000; 
const end = 1707350400;

const x2y2: Protocol = {
  "Staking Reward": manualStep(start, periodToSeconds.day, 1, 650_000_000), 
  "Liquidity Management": manualStep(start, periodToSeconds.day, 1, 15_000_000),
  "Airdrop": manualStep(start, periodToSeconds.day, 1, 120_000_000), 
  "Development & Team": [
    manualCliff(end - periodToSeconds.day,0),
    manualStep(start , periodToSeconds.day * 180, 4, 25_000_000), 
  ],
  "Treasury & Ecosystem": [
    manualCliff(end,12_500_000),
    manualStep(start  , periodToSeconds.day * 90, 8, 12_500_000), 
  ],
  "Presale": manualLinear(start, start + periodToSeconds.day * 360, 15_000_000), 

  meta: {
    notes: [
      `This represents the token emission and distribution details for X2Y2 based on the available information.`,
      `Changes may occur based on governance decisions and real-time adjustments.`,
    ],
    sources: [
      "https://docs.x2y2.io/tokens/tokenomics",
    ],
    token: "ethereum:0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9", 
    protocolIds: ["1431"], 
  },
  categories: {
    farming: ["Staking Reward"],
    airdrop: ["Airdrop"],
    insiders: ["Development & Team","Presale"],
    noncirculating: ["Treasury & Ecosystem"],
    liquidity: ["Liquidity Management"]
  },
};

export default x2y2;