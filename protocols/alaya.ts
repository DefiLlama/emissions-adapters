import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1747267200; // 2025-05-15 TGE
const total = 5e9;

const alaya: Protocol = {
  "IDO": manualCliff(start, total * 0.05),
  "Airdrop": manualCliff(start, total * 0.05),
  "Marketing": manualCliff(start, total * 0.07),
  "Liquidity": manualCliff(start, total * 0.04),
  "User Rewards": [
    manualCliff(start, total * 0.35 * 0.2),
    manualStep(start, periodToSeconds.month, 18, (total * 0.35 * 0.8) / 18),
  ],
  "KOL Round": [
    manualCliff(start + periodToSeconds.month * 6, total * 0.02 * 0.2),
    manualStep(
      start + periodToSeconds.month * 6,
      periodToSeconds.month,
      18,
      (total * 0.02 * 0.8) / 18,
    ),
  ],
  "Seed Round": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    18,
    (total * 0.08) / 18,
  ),
  "Private Round": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    18,
    (total * 0.08) / 18,
  ),
  "Adviser": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    24,
    (total * 0.02) / 24,
  ),
  "Team": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    36,
    (total * 0.08) / 36,
  ),
  "Community Treasury": manualStep(
    start + periodToSeconds.month * 6,
    periodToSeconds.month,
    36,
    (total * 0.06) / 36,
  ),
  "Ecosystem Fund": manualStep(
    start + periodToSeconds.month * 6,
    periodToSeconds.month,
    36,
    (total * 0.10) / 36,
  ),
  meta: {
    token: "bsc:0x5dBde81fcE337FF4bcaaEe4Ca3466C00aeCaE274",
    sources: ["https://medium.com/@alaya-ai/alaya-ai-official-tge-announcement-e88af94c32f4"],
    protocolIds: ["7627"],
    total,
  },
  categories: {
    publicSale: ["IDO"],
    airdrop: ["Airdrop"],
    insiders: ["Team", "Adviser", "Marketing"],
    privateSale: ["Seed Round", "Private Round", "KOL Round"],
    noncirculating: ["Community Treasury", "Ecosystem Fund"],
    liquidity: ["Liquidity"],
    farming: ["User Rewards"],
  },
};

export default alaya;
