import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const tge: number = 1620860400;
const qty: number = 10e6;

const metis: Protocol = {
  "Founding Team": manualStep(
    tge + periodToSeconds.month * 6,
    periodToSeconds.month * 3,
    8,
    (qty * 0.07) / 8,
  ),
  "MetisLab Foundation": [
    manualCliff(tge, 0.04 * qty * 0.1),
    manualStep(tge, periodToSeconds.month * 3, 8, (0.04 * qty * 0.9) / 8),
  ],
  Advisors: [
    manualCliff(tge, 0.015 * qty * 0.05),
    manualStep(tge, periodToSeconds.month * 3, 8, (0.015 * qty * 0.95) / 8),
  ],
  "Angel Investors": [
    manualCliff(tge, 0.01 * qty * 0.05),
    manualStep(tge, periodToSeconds.month * 3, 8, (0.01 * qty * 0.95) / 8),
  ],
  "Seed Investors": [
    manualCliff(tge, 0.06 * qty * 0.1),
    manualStep(tge, periodToSeconds.month * 3, 4, (0.06 * qty * 0.9) / 4),
  ],
  "Private Investors": [
    manualCliff(tge, 0.07 * qty * 0.1),
    manualStep(tge, periodToSeconds.month * 3, 4, (0.07 * qty * 0.9) / 4),
  ],
  "Community Star Investors": [
    manualCliff(tge, 0.03 * qty * 0.1),
    manualStep(tge, periodToSeconds.month, 12, (0.03 * qty * 0.9) / 12),
  ],
  "Strategic Investors": [
    manualCliff(tge, 0.015 * qty * 0.1),
    manualStep(tge, periodToSeconds.month, 12, (0.015 * qty * 0.9) / 12),
  ],
  IDO: manualCliff(tge, qty * 0.003),
  Airdrop: manualCliff(tge, qty * 0.06),
  "Liquidity Reserve": manualCliff(tge, qty * 0.06),
  "Community Development": [
    manualLinear(tge, tge + periodToSeconds.year, qty * 0.06),
    manualLinear(
      tge + periodToSeconds.year,
      tge + periodToSeconds.year * 2,
      qty * 0.03,
    ),
  ],
  "Transaction Mining": [
    manualLinear(tge, tge + periodToSeconds.year, qty * 0.1486),
    manualLinear(
      tge + periodToSeconds.year,
      tge + periodToSeconds.year * 10,
      qty * 0.3284,
    ),
  ],
  meta: {
    notes: [
      `Community Development and Transaction Mining allocations are to be released adhoc, here they have been assumed to unlock on a linear basis.`,
    ],
    sources: [
      "https://metisdao.medium.com/metis-to-launch-next-mining-phase-to-fuel-ecosystem-growth-353dfd0c2f62",
      "https://discord.com/channels/859838997874475008/859838998766682134/1126210173317427300",
    ],
    token: "ethereum:0x9e32b13ce7f2e80a01932b42553652e053d6ed8e",
    protocolIds: ["3228"],
  },
  categories: {
    insiders: [
      "Founding Team",
      "MetisLab Foundation",
      "Advisors",
      "Angel Investors",
      "Seed Investors",
      "Private Investors",
      "Community Star Investors",
      "Strategic Investors",
    ],
    publicSale: ["IDO", "Liquidity Reserve"],
    airdrop: ["Airdrop"],
    noncirculating: ["Community Development"],
    farming: ["Transaction Mining"],
  },
};
export default metis;
