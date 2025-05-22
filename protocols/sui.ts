import { Protocol } from "../types/adapters";
import { manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const total = 5e9; // 5 billion tokens
const start = 1683072000; // May 3, 2023

const sui: Protocol = {
  "Community Allocation Pool": [
    manualCliff(start, total * 0.0582 * 0.07),
    manualStep(start, periodToSeconds.month, 13, (total * 0.0582 * 0.93) / 13),
  ],
  "Community Reserve": [
    manualCliff(start, total * 0.3652 * 0.08),
    manualCliff(start + periodToSeconds.month, (total * 0.3652 * 0.92) / 84),
    manualStep(
      start + periodToSeconds.month,
      periodToSeconds.month,
      83,
      (total * 0.3652 * 0.92) / 84,
    ),
  ],
  "Early Contributors": [
    manualCliff(start + periodToSeconds.year, ((total * 0.2114) / 84) * 12),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      72,
      (total * 0.2114) / 84,
    ),
  ],
  "Mysten Labs Treasury": [
    manualCliff(start + periodToSeconds.months(6), ((total * 0.1242) / 84) * 6),
    manualStep(
      start + periodToSeconds.months(6),
      periodToSeconds.month,
      78,
      (total * 0.1242) / 84,
    ),
  ],
  "Series A": [
    manualCliff(start + periodToSeconds.year, (total * 0.0714) / 2),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      12,
      (total * 0.0714) / 24,
    ),
  ],
  "Series B": [
    manualCliff(start + periodToSeconds.year, (total * 0.0696) / 3),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      24,
      (total * 0.0696 * 2) / (24 * 3),
    ),
  ],
  "Stake Subsidies": [
    manualCliff(start, total * 0.1 * 0.03),
    manualStep(start, periodToSeconds.month, 84, (total * 0.1 * 0.97) / 84),
  ],
  meta: {
    sources: [
      "https://blog.sui.io/token-release-schedule/",
      "https://tokentrack.co/tokens/sui",
    ],
    token: "coingecko:sui",
    protocolIds: ["3181"],
    total,
    chain: 'sui'
  },
  categories: {
    publicSale: ["Community Allocation Pool"],
    noncirculating: ["Community Reserve","Mysten Labs Treasury"],
    farming: ["Stake Subsidies"],
    privateSale: ["Series A","Series B"],
    insiders: ["Early Contributors"],
  },
};

export default sui;
