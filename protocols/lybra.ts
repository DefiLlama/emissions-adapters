import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1682895600;
const qty = 100000000;
const token = "0xf1182229b71e79e504b1d2bf076c15a277311e05";
const chain = "ethereum";

const lybra: Protocol = {
  "Mining Pool": manualCliff(start, qty * 0.6), // dynamic
  Team: [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.085 * 0.2),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.month * 30,
      qty * 0.085 * 0.8,
    ),
  ],
  "Ecosystem Incentives": [
    manualCliff(start, qty * 0.1 * 0.02),
    manualLinear(start, start + periodToSeconds.year * 2, qty * 0.1 * 0.98),
  ],
  "Protocol Treasury": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    qty * 0.1,
  ),
  IDO: manualCliff(start, qty * 0.05),
  "LP Reserve": manualCliff(start, qty * 0.01),
  Advisors: [
    manualCliff(start + periodToSeconds.month, qty * 0.05 * 0.1),
    manualLinear(
      start + periodToSeconds.month,
      start + periodToSeconds.month * 13,
      qty * 0.05 * 0.9,
    ),
  ],
  meta: {
    token: `${chain}:${token}`,
    sources: [
      "https://docs.lybra.finance/lybra-finance-docs/tokenomics/lbr-tokenomics/token-allocation",
    ],
    notes: [
      "Mining Pool allocation (60%) has a dynamic unlock schedule, and has therefore been excluded from this analysis.",
      "Messages from mods in the Lybra Discord indicate that the sources here may be outdated.",
    ],
    protocolIds: ["2904"],
  },
  sections: {
    farming: ["Mining Pool", "Ecosystem Incentives"],
    publicSale: ["IDO", "LP Reserve"],
    insiders: ["Team", "Advisors"],
    noncirculating: ["Protocol Treasury"],
  },
};

export default lybra;
