import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { months } from "../utils/time";

const start = 1635379200; // Oct 28, 2021 TGE
const qty = 1000000000;

const clearpool: Protocol = {
  "Seed Investors": manualLinear(start, months(start, 12), qty * 0.0333),
  "Private Investors": [
    manualCliff(months(start, 3), qty * 0.09 * 0.2),
    manualLinear(months(start, 3), months(start, 15), qty * 0.09 * 0.8),
  ],
  "Public Investors": [
    manualCliff(start, (qty * 0.0035) / 2),
    manualCliff(months(start, 6), (qty * 0.0035) / 2),
  ],
  Team: [
    manualCliff(months(start, 6), qty * 0.15 * 0.2),
    manualLinear(months(start, 6), months(start, 30), qty * 0.15 * 0.8),
  ],
  Ecosystem: manualLinear(start, months(start, 24), qty * 0.1015),
  Partnerships: manualLinear(months(start, 6), months(start, 30), qty * 0.10),
  Rewards: manualLinear(start, months(start, 50), qty * 0.20),
  Liquidity: manualLinear(start, months(start, 12), qty * 0.15),
  Reserves: manualLinear(start, months(start, 60), qty * 0.1717),
  meta: {
    token: "ethereum:0x66761fa41377003622aee3c7675fc7b5c1c2fac5",
    sources: ["https://docs.clearpool.finance/clearpool/token/cpool/tokenomics"],
    protocolIds: ["parent#clearpool"],
    total: qty,
  },
  categories: {
    noncirculating: ["Ecosystem", "Partnerships", "Reserves"],
    farming: ["Rewards"],
    liquidity: ["Liquidity"],
    privateSale: ["Seed Investors", "Private Investors"],
    publicSale: ["Public Investors"],
    insiders: ["Team"],
  },
};

export default clearpool;
