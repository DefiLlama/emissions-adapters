import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { years } from "../utils/time";

const start = 1664323200; // 2022-09-28
const total = 1e9;

const safe: Protocol = {
  Airdrop: [
    manualCliff(start, total * 0.025),
    manualLinear(start, years(start, 4), total * 0.025),
  ],
  "Core Contributors": manualLinear(
    start,
    years(start, 4),
    total * 0.15,
  ),
  "Safe Foundation": [
    manualCliff(start, total * 0.02),
    manualLinear(start, years(start, 4), total * 0.05),
  ],
  Guardians: [
    manualCliff(start, total * 0.0125),
    manualLinear(start, years(start, 4), total * 0.0375),
  ],
  "Safe DAO Treasury": [
    manualCliff(start, total * 0.05),
    manualLinear(start, years(start, 8), total * 0.35),
  ],
  "Gnosis DAO Treasury": [
    manualCliff(start, total * 0.01),
    manualLinear(start, years(start, 4), total * 0.14),
  ],
  "Joint Treasury": manualCliff(start, total * 0.05),
  "Strategic Raise": [
    manualCliff(years(start, 1), total * 0.02),
    manualLinear(
      years(start, 1),
      years(start, 4),
      total * 0.06,
    ),
  ],
  meta: {
    sources: ["https://safefoundation.org/blog/safe-tokenomics"],
    token: "ethereum:0x5aFE3855358E112B5647B952709E6165e1c1eEEe",
    protocolIds: ["3320"],
    total,
  },
  categories: {
    noncirculating: ["Safe DAO Treasury", "Gnosis DAO Treasury", "Joint Treasury"],
    airdrop: ["Airdrop"],
    privateSale: ["Strategic Raise"],
    insiders: ["Core Contributors", "Safe Foundation", "Guardians"],
  },
};
export default safe;
