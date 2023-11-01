import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1698760800; // Date and time (GMT): Tuesday, 31 October 2023 14:00:00
const qty = 1000000000; //1b
const qtyEcosystem = 268000000
const qtyCORE = 176000000
const qtySEED = 159000000
const qtyAB = 197000000

const celestia: Protocol = {
  "Public Allocation": manualCliff(start, qty * 0.2),
  "R&D & Ecosystem": [
    manualCliff(start, qtyEcosystem * 0.25), // 25% 
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.day,
      1095,
      (qtyEcosystem * 0.75) / 1095,
    ), //
  ],
  "Initial Core Contributors": [
    manualCliff(start + periodToSeconds.year, qtyCORE * 0.33), // 33%
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.day,
      1095,
      (qtyCORE * 0.67) / 1095,
    ), // 
  ],
  "Early Backers Seed": [
    manualCliff(start + periodToSeconds.year, qtySEED * 0.33), // 33% 
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.day,
      365,
      (qtySEED * 0.67) / 365,
    ), //
  ],
  "Early Backers Series A&B": [
    manualCliff(start + periodToSeconds.year, qtyAB * 0.33), // 25% 
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.day,
      365,
      (qtyAB * 0.67) / 365,
    ), // monthly steps for the next 3 years
  ],
  meta: {
    notes: [
      `Celestia’s 1 billion TIA supply at genesis will be subject to several different unlock schedules. All tokens, locked or unlocked, may be staked, but staking rewards are unlocked upon receipt.`,
    ],
    token: "ethereum:-",
    sources: ["https://docs.celestia.org/learn/staking-governance-supply/"],
    protocolIds: ["3562"], 
  },
  categories: {
    insiders: ["Initial Core Contributors", "Early Backers Seed", "Early Backers Series A&B"],
    publicSale: [],
    airdrop: ["Public Allocation"],
    farming: ["R&D & Ecosystem"]
  },
};
export default celestia;