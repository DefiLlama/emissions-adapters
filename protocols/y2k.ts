import { balance, latest } from "../adapters/balance";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const qty: number = 20e6;
const token: string = "0x5a98fcbea516cf06857215779fd812ca3bef1b32";
const start: number = 1666911600;
const chain: string = "arbitrum";

const y2k: Protocol = {
  "Liquidity Mining": manualLinear(
    start,
    start + periodToSeconds.year * 4,
    0.3,
  ),
  Treasury: manualLinear(start, start + periodToSeconds.year * 4, 0.35),
  "Core Team": [
    manualCliff(start + periodToSeconds.month * 9, qty * 0.015),
    manualLinear(
      start + periodToSeconds.month * 9,
      start + periodToSeconds.month * 24,
      qty * 0.135,
    ),
  ],
  "New Order Treasury": manualLinear(
    start,
    start + periodToSeconds.year * 4,
    0.1,
  ),
  Investors: [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.005),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.month * 24,
      qty * 0.045,
    ),
  ],
  IFO: manualCliff(start, qty * 0.05),
  meta: {
    notes: [
      "We could not contact the Y2K team to find wallet addresses, so we have assumed Liquidity Mining, Treasury and New Order Treasury unlocks to be linear over 4 years.",
    ],
    sources: [`https://y2k-finance.gitbook.io/y2k-finance/tokenomics/y2k`],
    token: `${chain}:${token}`,
    protocolIds: ["2375", "3056"],
  },
  categories: {
    insiders: ["Core Team", "New Order Treasury", "Investors"],
    publicSale: ["IFO"],
    noncirculating: ["Treasury"],
  },
};
export default y2k;
