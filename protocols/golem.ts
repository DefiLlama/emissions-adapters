import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1478822400; // 11 November 2016 00:00:00
const qty = 1000000000; //1b
const end = 1762819200

const golem: Protocol = {
  "TGE": manualCliff(start, qty * 0.82),
  "Team Incentives & Project Development": [manualCliff(start + 6 * periodToSeconds.month, qty * 0.12), manualCliff(end, qty * 0),],
  "Early Contributors & Team Members": manualCliff(start + 6 * periodToSeconds.month, qty * 0.06),
  meta: {
    notes: [
      `The max supply of this token is capped at 1,000,000,000. The supply of Golem (GLM) has fully unlocked.`,
    ],
    token: "ethereum:0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429",
    sources: ["https://www.coingecko.com/en/coins/golem/tokenomics"],
    protocolIds: ["3224"],
  },
  categories: {
    insiders: ["Early Contributors & Team Members", "Team Incentives & Project Development"],
    publicSale: ["TGE"],
    airdrop: []
  },
};
export default golem;