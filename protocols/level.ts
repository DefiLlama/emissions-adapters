import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1672531200;
const qty = 50e6;

const level: Protocol = {
  "LP incentives": [
    manualLinear("2023-01-01", "2023-01-16", 15 * 32e3),
    manualLinear("2023-01-16", "2023-02-10", 25 * 3e3),
  ],
  "Senior Tranche": [
    manualLinear("2023-01-01", "2023-01-16", 15 * 12e3),
    manualLinear("2023-01-16", "2023-01-28", 12 * 6e3),
    manualLinear("2023-01-28", "2023-02-10", 13 * 1800),
  ],
  "Mezzanine Tranche": [
    manualLinear("2023-01-01", "2023-01-16", 15 * 20e3),
    manualLinear("2023-01-16", "2023-01-28", 12 * 10e3),
    manualLinear("2023-01-28", "2023-02-10", 13 * 3e3),
  ],
  "Junior Tranche": [
    manualLinear("2023-01-01", "2023-01-16", 15 * 16e3),
    manualLinear("2023-01-16", "2023-01-28", 12 * 8e3),
    manualLinear("2023-01-28", "2023-02-10", 13 * 2200),
  ],
  "Trading Rewards": [
    manualLinear("2023-01-08", "2023-01-16", 7 * 20e3),
    manualLinear("2023-01-16", "2023-01-23", 7 * 36e3),
    manualLinear("2023-01-23", "2023-01-28", 5 * 18e3),
  ],
  Team: manualStep("2023-12-26", periodToSeconds.year, 3, qty * 0.2),
  "Liquidity Bootstrap": manualCliff("2022-12-12", 1e6),
  "Strategic Sale 1": manualCliff("2024-01-09", 1e6),
  "Strategic Sale 2": manualLinear("2023-07-11", "2024-02-11", 2e5),
  "Strategic Sale 3": manualLinear("2023-07-12", "2024-02-12", 121212),
  "Strategic Sale 4": manualLinear("2023-07-15", "2024-02-15", 47e3),
  "Ladder Incentives": manualLinear("2023-04-26", "2027-04-26", 4 * 365 * 1e4),
  meta: {
    notes: [
      `The unlocks schedule for ladder has assumed that all 10k LVL are claimed each day`,
      `LVL auctions and Referrral incentives are unpredictable and have therefore been excluded from this analysis.`,
    ],
    token: "bsc:0xB64E280e9D1B5DbEc4AcceDb2257A87b400DB149",
    sources: ["https://docs.level.finance/tokenomics/lvl-utility-token"],
    protocolIds: ["2395"],
  },
  categories: {
    insiders: [
      "Strategic Sale 1",
      "Strategic Sale 2",
      "Strategic Sale 3",
      "Strategic Sale 4",
      "Team",
    ],
    farming: [
      "Ladder Incentives",
      "Trading Rewards",
      "Junior Tranche",
      "Mezzanine Tranche",
      "Sneior Tranche",
      "LP incentives",
    ],
    publicSale: ["Liquidity Bootstrap"],
  },
};

export default level;
