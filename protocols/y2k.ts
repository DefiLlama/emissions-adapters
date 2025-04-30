import { balance, latest } from "../adapters/balance";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const qty: number = 20e6;
const token: string = "0x5a98fcbea516cf06857215779fd812ca3bef1b32";
const start: number = 1666911600;
const chain: string = "arbitrum";
const unlock1: number = 1696892400
const unlock2: number = 1687129200
const y2k: Protocol = {
  "Liquidity Mining": manualLinear(
    start,
    start + periodToSeconds.year * 4,
    qty * 0.3,
  ),
  Treasury: manualLinear(start, start + periodToSeconds.year * 4, qty * 0.425),
  "Core Team": [
    manualCliff(unlock1, qty * 0.015),
    manualLinear(unlock1, unlock1 + periodToSeconds.month * 15, qty * 0.135),
  ],
  "New Order Treasury": manualLinear(
    unlock1,
    unlock1 + periodToSeconds.year * 4,
    qty * 0.025,
  ),
  Investors: [
    manualCliff(unlock2, qty * 0.005),
    manualLinear(unlock2, unlock2 + periodToSeconds.month * 18, qty * 0.045),
  ],
  IFO: manualCliff(start, qty * 0.05),
  meta: {
    notes: [
      "We could not contact the Y2K team to find wallet addresses, so we have assumed Liquidity Mining, Treasury and New Order Treasury unlocks to be linear over 4 years.",
    ],
    sources: [
      `https://y2k-finance.gitbook.io/y2k-finance/tokenomics/tokenomics-distribution`,
    ],
    token: `${chain}:${token}`,
    protocolIds: ["2375", "3056"],
    total: qty
  },
  categories: {
    publicSale: ["IFO"],
    noncirculating: ["Treasury"],
    privateSale: ["Investors"],
    insiders: ["Core Team","New Order Treasury"],
  },
};
export default y2k;
