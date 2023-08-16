import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1692662400; //22-08-23
const qty = 100000000;
const qtyIDO = 9200000
const end_3months = 1700265600
const qtyECO = 15000000
const endClifTreasury = 1708214400
const shedule_Start = 1693526400 // 1/09/2023

const lineabank: Protocol = {
  "Inicial Liquidity": manualCliff(start, qty * 0.015),
  "Pre mining": manualCliff(start, qty * 0.03),
  "IDO": [
    manualCliff(start, qtyIDO * 0.30), 
    manualLinear(start , start + 24 * periodToSeconds.month, 0.7 * qtyIDO),
  ],
  "Liquidity Incentives": manualLinear(
    shedule_Start,
    shedule_Start + 5 * periodToSeconds.year,
    0.445 * qty,
  ),
  "Development Fund": manualLinear(
    start,
    end_3months + 24 * periodToSeconds.month,
    0.15 * qty,
  ),
  "Ecosystem Fund": [
    manualCliff(start, qtyECO * 0.02), // 
    manualLinear(start, start + 24 * periodToSeconds.month, 0.98 * qtyECO),
  ],
  "LineaBank Treasury": manualLinear(
    start,
    endClifTreasury + 24 * periodToSeconds.month,
    0.118 * qty,
  ),
  meta: {
    notes: [
      `We have divided the Inicial Mint field into unlocked and locked.`,
      `Liquidity Incentives. emissions are based on tvl/volume (between 0.08s-0.01)`,
    ],
    token: "linea:0xB97F21D1f2508fF5c73E7B5AF02847640B1ff75d",
    sources: ["https://docs.lineabank.finance/about-lab-token/distribution"],
    protocolIds: ["3250"],
  },
  categories: {
    insiders: ["Development Fund"],
    publicSale: ["IDO"],
    farming: ["Liquidity Incentives"],
    noncirculating: ["LineaBank Treasury", "Ecosystem Fund"],
    airdrop: ["Pre mining"]
  },
};
export default lineabank;