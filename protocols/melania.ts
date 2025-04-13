import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1737244800;
const totalSupply = 1_000_000_000;

// Allocation amounts
const team = totalSupply * 0.3
const treasury = totalSupply * 0.3
const community = totalSupply * 0.2
const publicSale = totalSupply * 0.2

const melania: Protocol = {
  "Public Distribution": manualCliff(start, publicSale),
  "Community": manualCliff(start, community),
  "Treasury": manualCliff(start, treasury),

  "Team Vesting": [
    manualCliff(start + periodToSeconds.month, team * 0.1),
    manualStep(
      start + periodToSeconds.months(2),
      periodToSeconds.month,
      12,
      team * 0.9 / 12 // 90% over 12 months
    )
  ],
  
  meta: {
    token: "solana:FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P",
    sources: ["https://melaniameme.com/#distribution"],
    protocolIds: ["6036"],
    notes: [
      "The tokenomics changed from the original web from January, this analysis is based on the new one (as per 12 April 2025).",
      "Community and Treasury are assumed to be unlocked at TGE.",
    ]
  },

  categories: {
    insiders: [
      "Team Vesting",
    ],
    noncirculating: [
      "Community",
      "Treasury",
    ],
    publicSale: [
      "Public Distribution",
    ],
  },
};

export default melania;