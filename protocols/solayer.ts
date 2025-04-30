import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 1_000_000_000;
const start = 1739145600;

const solayer: Protocol = {

  "Emerald Card Sale":
    manualCliff(start, totalSupply * 0.03), // 3% at TGE

  "Genesis Drop":
    manualCliff(start, totalSupply * 0.12), // 12% at TGE

  "Liquidity":
    manualCliff(start, totalSupply * 0.06), // 6% at TGE

  "Community and Ecosystem":
    manualStep(
      start,
      periodToSeconds.months(3),
      16, // 4 years in quarters
      (totalSupply * 0.2823) / 16 // Community and Ecosystem (28.23%)
    ),

  "Community Incentives":
    manualLinear(
      start,
      start + periodToSeconds.months(7),
      totalSupply * 0.02 // 2% over 6 months
    ),

  // Team & Advisors (17.11%) - 1y cliff + 3y linear monthly
  "Team and Advisors":
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.year * 4, // 3 years after cliff
      totalSupply * 0.1711
    ),


  // Investors (16.66%) - 1y cliff + 2y linear monthly
  "Investors":
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.year * 3, // 2 years after cliff
      totalSupply * 0.1666
    ),

  //Foundation 15% vested every 3 months over 4 years
  "Foundation":
    manualStep(
      start,
      periodToSeconds.months(3),
      16, // 4 years in quarters
      (totalSupply * 0.15) / 16 // Foundation (15%)
    ),

  meta: {
    sources: ["https://docs.solayer.org/documentation/Tokenomics"],
    token: "solana:LAYER4xPpTCb3QL8S9u41EAhAX7mhBn8Q6xMTwY2Yzc",
    protocolIds: ["parent#solayer"],
    notes: []
  },

  categories: {
    publicSale: ["Emerald Card Sale"],
    farming: ["Community Incentives"],
    noncirculating: ["Community and Ecosystem","Foundation"],
    liquidity: ["Liquidity"],
    airdrop: ["Genesis Drop"],
    privateSale: ["Investors"],
    insiders: ["Team and Advisors"],
  },
};

export default solayer;