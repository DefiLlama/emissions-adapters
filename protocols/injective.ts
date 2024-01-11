import { Protocol } from "../types/adapters";
import { manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalQty = 100_000_000;
const start = 1601510400;
const aptos: Protocol = {
  "Binance Launchpad": [manualCliff(start, totalQty * 0.09)],
  Community: [
    manualStep(
      start + periodToSeconds.month,
      periodToSeconds.month,
      10,
      totalQty * 0.01
    ),
  ],
  Ecosystem: [
    manualCliff(start + periodToSeconds.month * 7, totalQty * 0.36 * 0.17),
    manualStep(
      start + periodToSeconds.month * 7,
      periodToSeconds.month * 3,
      9,
      (totalQty * 0.36 * 0.83) / 9
    ),
  ],
  Team: [
    manualStep(
      start + periodToSeconds.month * 9,
      periodToSeconds.month * 6,
      5,
      (totalQty * 0.2) / 5
    ),
  ],
  "Private Sale": [
    manualStep(
      start + periodToSeconds.month * 6,
      periodToSeconds.month * 6,
      3,
      (totalQty * 0.167) / 3
    ),
  ],
  "Seed Sale": [
    manualStep(
      start + periodToSeconds.month * 7,
      periodToSeconds.month * 6,
      3,
      totalQty * 0.06 * 0.33
    ),
  ],
  Advisors: [
    manualStep(
      start + periodToSeconds.month * 9,
      periodToSeconds.month * 6,
      6,
      totalQty * 0.02 * 0.167
    ),
  ],
  meta: {
    sources: ["https://cryptorank.io/price/injective-protocol/vesting"],
    token: "coingecko:injective-protocol",
    protocolIds: ["4011"],
  },
  categories: {
    insiders: ["Team", "Private Sale", "Seed Sale", "Advisors"],
    noncirculating: ["Ecosystem", "Community"],
    airdrop: ["Binance Launchpad"],
  },
};
export default aptos;
