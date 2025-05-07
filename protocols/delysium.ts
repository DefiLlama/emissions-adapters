import { Protocol } from "../types/adapters";
import { manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1681171200;
const totalSupply = 3_000_000_000;

const airdrop = totalSupply * 0.01;
const team = totalSupply * 0.20;
const strategicSale = totalSupply * 0.10;
const privateSale = totalSupply * 0.10;
const marketMaker = totalSupply * 0.02;
const treasury = totalSupply * 0.57;

const delysium: Protocol = {
   "Airdrop": manualCliff(start, airdrop),
   "Market Maker": manualCliff(start, marketMaker),
   "Treasury": [
    manualCliff(start, 60_000_000),
    manualStep(
      start,
      periodToSeconds.month,
      48,
      (treasury - 60_000_000) / 48
    )
   ],
   "Strategic Sale": manualStep(
    start + periodToSeconds.months(6),
    periodToSeconds.month,
    36,
    strategicSale / 36
   ),
   "Private Sale": [
    manualCliff(
      start + periodToSeconds.year,
      privateSale * 0.2,
    ),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.months(3),
      8,
      privateSale * 0.1
    )
   ],
   "Team": manualStep(
    start + periodToSeconds.years(2),
    periodToSeconds.month,
    24,
    team / 24
   ),



  meta: {
    token: "coingecko:delysium",
    sources: ["https://www.gate.io/startup/754"],
    protocolIds: ["6142"],
    notes: [
    ]
  },

  categories: {
    privateSale: ["Private Sale", "Strategic Sale"],
    insiders: ["Team"],
    noncirculating: ["Treasury"],
    airdrop: ["Airdrop"],
    liquidity: ["Market Maker"],
  }
};

export default delysium;
