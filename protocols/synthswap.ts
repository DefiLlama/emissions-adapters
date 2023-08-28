import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1690977600; // 02-08-2023
const datavest = 1698941417
const qtylo = 37500
const qty = 250000;
const qtyMark = 50000
const synthswap: Protocol = {
  "Protocol Owned Liquidity": manualCliff(start, qty * 0.05),
  "Liquidity Incentives": manualLinear(
    start,
    start + 3 * periodToSeconds.year,
    0.35 * qty,
  ),
  "Core Contributors": manualLinear(
    start,
    start + 3 * periodToSeconds.year,
    0.25 * qty,
  ),
  "Development & Marketing": [
    manualCliff(start, qtyMark * 0.15), 
    manualLinear(
        start,
        start + 2 * periodToSeconds.year,
        0.85 * qtyMark,
      ),
  ],
  "Ecosystem & Partners": [
    manualLinear(
        datavest,
        datavest + 2 * periodToSeconds.year,
        0.15 * qty,
      ),
  ],
  meta: {
    notes: [
      `The token distribution follows a fixed supply, linear emission model coupled with burning or deflationary mechanisms to reduce overall supply.`,
    ],
    token: "base:0xbd2DBb8eceA9743CA5B16423b4eAa26bDcfE5eD2",
    sources: ["https://docs.synthswap.io/tokenomics/synth-token"],
    protocolIds: ["3322", "3385", "3431"],
  },
  categories: {
    insiders: ["Development & Marketing", "Core Contributors"],
    publicSale: ["Protocol Owned Liquidity"],
    farming: ["Liquidity Incentives"]
  },
};
export default synthswap;