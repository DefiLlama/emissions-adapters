import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1697500800; // 17 oct?!
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
      periodToSeconds.month,
      36,
      (qtyEcosystem * 0.75) / 36,
    ), // monthly steps for the next 3 years
  ],
  "Initial Core Contributors": [
    manualCliff(start + periodToSeconds.year, qtyCORE * 0.33), // 33%
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      36,
      (qtyCORE * 0.67) / 36,
    ), // monthly steps for the next 3 years
  ],
  "Early Backers Seed": [
    manualCliff(start + periodToSeconds.year, qtySEED * 0.33), // 33% 
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      24,
      (qtySEED * 0.67) / 24,
    ), // monthly steps for the next 3 years
  ],
  "Early Backers Series A&B": [
    manualCliff(start + periodToSeconds.year, qtyAB * 0.33), // 25% 
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      24,
      (qtyAB * 0.67) / 24,
    ), // monthly steps for the next 3 years
  ],
  meta: {
    notes: [
      `Celestia’s 1 billion TIA supply at genesis will be subject to several different unlock schedules. All tokens, locked or unlocked, may be staked, but staking rewards are unlocked upon receipt.`,
    ],
    token: "ethereum:-",
    sources: ["https://docs.celestia.org/learn/staking-governance-supply/"],
    protocolIds: ["2519"], //add correct id
  },
  categories: {
    insiders: ["Initial Core Contributors", "Early Backers Seed", "Early Backers Series A&B"],
    publicSale: [],
    airdrop: ["Public Allocation"],
    farming: ["R&D & Ecosystem"]
  },
};
export default celestia;