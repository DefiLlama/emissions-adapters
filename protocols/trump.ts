import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1737133200; // January 18, 2025

const trump: Protocol = {
  "Public Distribution": [
    manualCliff(start, 100_000_000), // 100% at TGE
  ],
  "Liquidity": [
    manualCliff(start, 100_000_000), // 100% at TGE
  ],
  "Creators & CIC Digital 1": [
    manualCliff(start + periodToSeconds.month * 3, 36_000_000), // 10% unlock after 3 months
    manualLinear(
      start + periodToSeconds.month * 3,
      start + periodToSeconds.month * 27, // 3 + 24 months
      324_000_000 // Remaining 90% over 24 months
    ),
  ],
  "Creators & CIC Digital 2": [
    manualCliff(start + periodToSeconds.month * 6, 45_000_000), // 25% unlock after 6 months
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.month * 30, // 6 + 24 months
      135_000_000 // Remaining 75% over 24 months
    ),
  ],
  "Creators & CIC Digital 3": [
    manualCliff(start + periodToSeconds.month * 12, 45_000_000), // 25% unlock after 12 months
    manualLinear(
      start + periodToSeconds.month * 12,
      start + periodToSeconds.month * 36, // 12 + 24 months
      135_000_000 // Remaining 75% over 24 months
    ),
  ],
  "Creators & CIC Digital 4": [
    manualCliff(start + periodToSeconds.month * 3, 4_000_000), // 10% unlock after 3 months
    manualLinear(
      start + periodToSeconds.month * 3,
      start + periodToSeconds.month * 27, // 3 + 24 months
      36_000_000 // Remaining 90% over 24 months
    ),
  ],
  "Creators & CIC Digital 5": [
    manualCliff(start + periodToSeconds.month * 6, 5_000_000), // 25% unlock after 6 months
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.month * 30, // 6 + 24 months
      15_000_000 // Remaining 75% over 24 months
    ),
  ],
  "Creators & CIC Digital 6": [
    manualCliff(start + periodToSeconds.month * 12, 5_000_000), // 25% unlock after 12 months
    manualLinear(
      start + periodToSeconds.month * 12,
      start + periodToSeconds.month * 36, // 12 + 24 months
      15_000_000 // Remaining 75% over 24 months
    ),
  ],
  meta: {
    sources: ["https://gettrumpmemes.com/"],
    token: "coingecko:official-trump",
    protocolIds: ["6017"]
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