import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const total: number = 1e9;
const start: number = 1707264000;

const navi: Protocol = {
  Team: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(30),
    total * 0.2,
  ),
  Treasury: manualLinear(
    start,
    start + periodToSeconds.months(24),
    total * 0.1,
  ),
  "Liquidity Provision": manualCliff(start, total * 0.04),
  "Public Sale": manualCliff(start, total * 0.012),
  Marketing: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(24),
    total * 0.03,
  ),
  "Ecosystem & Airdrop": manualLinear(
    start,
    start + periodToSeconds.months(36),
    total * 0.458,
  ),
  "Investors & Advisors": manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(24),
    total * 0.16,
  ),
  meta: {
    notes: [],
    sources: [
      "https://naviprotocol.gitbook.io/navi-protocol-docs/dao-and-token/navx-tokenomics",
    ],
    token: `coingecko:navi`,
    protocolIds: ["3323", "5326"],
    total,
  },
  categories: {
    publicSale: ["Public Sale", "Liquidity Provision"],
    farming: ["Ecosystem & Airdrop"],
    insiders: ["Team", "Investors & Advisors", "Marketing"],
    noncirculating: ["Treasury"],
  },
};
export default navi;
