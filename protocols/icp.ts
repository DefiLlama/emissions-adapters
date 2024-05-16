import { manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1620604800;
const total = 469e6;
const timestamps = {
  seed: 1485907200,
};
const icp: Protocol = {
  "Seed Round": manualLinear(
    timestamps.seed,
    timestamps.seed + periodToSeconds.years(4),
    130000000, // 390M / 0.03
  ),
  "Strategic Round": manualStep(
    start,
    periodToSeconds.month,
    36,
    (total * 0.07) / 36,
  ),
  Presale: manualStep(
    start + periodToSeconds.month,
    periodToSeconds.month,
    12,
    (total * 0.0496) / 12,
  ),
  Airdrop: manualStep(start, periodToSeconds.month, 12, (total * 0.008) / 12),
  meta: {
    token: `coingecko:internet-computer`,
    sources: [
      "https://wiki.internetcomputer.org/wiki/Total_supply,_circulating_supply,_and_staked_ICP",
      "https://internetcomputer.academy/tokenomics/",
    ],
    notes: [
      `The remaining 279M ICP are unaccounted for and have therefore been excluded from this analysis.`,
    ],
    protocolIds: ["4618"],
  },
  categories: {
    insiders: ["Strategic Round", "Presale"],
    publicSale: ["Seed Round"],
    airdrop: ["Airdrop"],
  },
};

export default icp;
