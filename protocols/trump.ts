import { Protocol } from "../types/adapters";
import { manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1705536000; // January 18, 2025

const trump: Protocol = {
  "Creators & CIC Digital 1": [
    manualCliff(start + periodToSeconds.month * 3, 36_000_000), // 10% unlock after 3 months
    manualStep(
      start + periodToSeconds.month * 3,
      periodToSeconds.day,
      730,
      324_000_000 / 730 // Remaining 90% over 24 months daily
    ),
  ],
  "Creators & CIC Digital 2": [
    manualCliff(start + periodToSeconds.month * 6, 45_000_000), // 25% unlock after 6 months
    manualStep(
      start + periodToSeconds.month * 6,
      periodToSeconds.day,
      730,
      135_000_000 / 730 // Remaining 75% over 24 months daily
    ),
  ],
  "Creators & CIC Digital 3": [
    manualCliff(start + periodToSeconds.month * 12, 45_000_000), // 25% unlock after 12 months
    manualStep(
      start + periodToSeconds.month * 12,
      periodToSeconds.day,
      730,
      135_000_000 / 730 // Remaining 75% over 24 months daily
    ),
  ],
  "Creators & CIC Digital 4": [
    manualCliff(start + periodToSeconds.month * 3, 4_000_000), // 10% unlock after 3 months
    manualStep(
      start + periodToSeconds.month * 3,
      periodToSeconds.day,
      730,
      36_000_000 / 730 // Remaining 90% over 24 months daily
    ),
  ],
  "Creators & CIC Digital 5": [
    manualCliff(start + periodToSeconds.month * 6, 5_000_000), // 25% unlock after 6 months
    manualStep(
      start + periodToSeconds.month * 6,
      periodToSeconds.day,
      730,
      15_000_000 / 730 // Remaining 75% over 24 months daily
    ),
  ],
  "Creators & CIC Digital 6": [
    manualCliff(start + periodToSeconds.month * 12, 5_000_000), // 25% unlock after 12 months
    manualStep(
      start + periodToSeconds.month * 12,
      periodToSeconds.day,
      730,
      15_000_000 / 730 // Remaining 75% over 24 months daily
    ),
  ],
  "Public Distribution": [
    manualCliff(start, 100_000_000), // 100% at TGE
  ],
  "Liquidity": [
    manualCliff(start, 100_000_000), // 100% at TGE
  ],
  meta: {
    sources: ["https://gettrumpmemes.com/"],
    token: "coingecko:official-trump",
    protocolIds: []
  },
  categories: {
    insiders: [
      "Creators & CIC Digital 1",
      "Creators & CIC Digital 2",
      "Creators & CIC Digital 3",
      "Creators & CIC Digital 4",
      "Creators & CIC Digital 5",
      "Creators & CIC Digital 6"
    ],
    noncirculating: ["Liquidity"],
    publicSale: ["Public Distribution"],
  },
};

export default trump;
