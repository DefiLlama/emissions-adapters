import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const qty = 4294967296;

const optimism: Protocol = {
  "Ecosystem Fund": [
    manualLinear("2022-06-01", "2023-04-31", 94175479),
    manualLinear("2023-05-01", "2024-04-31", 90e6),
    manualLinear("2024-05-01", "2025-04-31", 94e6),
    manualLinear("2025-05-01", "2026-04-31", 108e6),
  ],
  "Retroactive Public Goods Funding": [
    manualLinear("2022-06-01", "2023-04-31", 3710574),
    manualLinear("2023-05-01", "2024-04-31", 9e7),
    manualLinear("2024-05-01", "2025-04-31", 12e7),
    manualLinear("2025-05-01", "2026-04-31", 42e7),
  ],
  Airdrops: [
    manualCliff("2022-06-01", qty * 0.05),
    manualCliff("2023-02-09", 11742277),
  ],
  Team: [
    manualCliff("2023-05-31", qty * 0.19 * 0.25),
    manualStep(
      "2023-05-31",
      periodToSeconds.month,
      36,
      (qty * 0.19 * 0.75) / 36,
    ),
  ],
  Investors: [
    manualCliff("2023-05-31", qty * 0.17 * 0.25),
    manualStep(
      "2023-05-31",
      periodToSeconds.month,
      36,
      (qty * 0.17 * 0.75) / 36,
    ),
  ],
  meta: {
    notes: [
      `Total supply inflates at 2% per year but the documentation doesnt describe how they're allocated.`,
      `35% of initial total supply has not been allocated by the foundation.`,
      `Ecosystem fund and Retroactive Public Goods Funding unlocks have been estimated in the referenced spreadsheet.`,
      `Futures airdrops (14%) are unpredictable and have therefore been excluded from analysis.`,
    ],
    token: "optimism:0x4200000000000000000000000000000000000042",
    sources: [
      "https://docs.google.com/spreadsheets/d/1qVMhLmmch3s6XSbiBe8hgD4ntMkPIOhc1WrhsYsQc7M/edit#gid=1283480580",
      "https://community.optimism.io/docs/governance/allocations/",
      "https://discord.com/channels/667044843901681675/667044844366987296/1111586687605297152",
    ],
    protocolIds: ["2967"],
  },
  categories: {
    insiders: ["Team", "Investors"],
    airdrop: ["Airdrops"],
    noncirculating: ["Retroactive Public Goods Funding", "Ecosystem Fund"],
  },
};

export default optimism;
