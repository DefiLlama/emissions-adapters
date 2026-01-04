import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1749513600;
const total = 1e9;

const resolv: Protocol = {
  "Airdrop Season 1": manualCliff(start, total * 0.10),
  "Ecosystem & Community": [
    manualCliff(start, total * 0.10),
    manualStep(start, periodToSeconds.month, 24, (total * 0.309) / 24),
  ],
  "Team & Contributors": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    30,
    (total * 0.267) / 30,
  ),
  Investors: manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    24,
    (total * 0.224) / 24,
  ),
  meta: {
    notes: [
      "Airdrop S1 top wallets subject to short-term unlock schedule not modeled.",
      "Ecosystem TGE unlock assumed 10% (docs say 'up to 10%').",
    ],
    token: "coingecko:resolv",
    sources: ["https://docs.resolv.xyz/litepaper/resolv-token/resolv-token-overview"],
    protocolIds: ["5655"],
    total,
  },
  categories: {
    airdrop: ["Airdrop Season 1"],
    farming: ["Ecosystem & Community"],
    insiders: ["Team & Contributors", "Investors"],
  },
};

export default resolv;
