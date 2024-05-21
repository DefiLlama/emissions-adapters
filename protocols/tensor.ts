import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 0;
const total = 1e9;

const tensor: Protocol = {
  "Core Contributors": [
    manualCliff(start + periodToSeconds.year, (total * 0.27) / 4),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      (total * 0.27 * 3) / 4,
    ),
  ],
  Community: [
    manualCliff(start, total * 0.127),
    manualLinear(start, start + periodToSeconds.years(3), total * 0.275),
  ],
  Airdrop: manualCliff(start, total * 0.125),
  "Power User Airdrop": [
    manualCliff(start + periodToSeconds.months(6), (total * 0.023) / 4),
    manualLinear(
      start + periodToSeconds.months(6),
      start + periodToSeconds.years(2),
      (total * 0.023 * 3) / 4,
    ),
  ],
  "Investors & Advisors": [
    manualCliff(start + periodToSeconds.year, (total * 0.09) / 4),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      (total * 0.09 * 3) / 4,
    ),
  ],
  Reserve: manualCliff(start, total * 0.09),
  meta: {
    token: `coingecko:tensor`,
    sources: ["https://docs.tensor.foundation/tokenomics"],
    notes: [],
    protocolIds: ["4640"],
  },
  categories: {
    insiders: ["Core Contributors", "Investors & Advisors"],
    farming: ["Community"],
    airdrop: ["Airdrop", "Power User Airdrop"],
    noncirculating: ["Reserve"],
  },
};

export default tensor;
