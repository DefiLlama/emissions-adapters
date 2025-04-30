import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1683154800;
const qty = 1000000000;
const cetus: Protocol = {
  Community: manualCliff(start, qty * 0.5),
  "Team & Advisors": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    24,
    (qty * 0.2) / 24,
  ),
  Investors: manualStep(
    start + periodToSeconds.month * 6,
    periodToSeconds.month,
    12,
    (qty * 0.15) / 12,
  ),
  "Liquidity Treasury": manualCliff(start, qty * 0.15),
  meta: {
    token:
      "sui:0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS",
    sources: ["https://cetus-1.gitbook.io/cetus-docs/tokenomics/cetus"],
    notes: [],
    protocolIds: ["2289"],
  },
  categories: {
    farming: ["Community"],
    publicSale: ["Liquidity Treasury"],
    privateSale: ["Investors"],
    insiders: ["Team & Advisors"],
  },
};

export default cetus;
