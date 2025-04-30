import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const total = 1e9;
const start = 1710806400;

const polyhedra: Protocol = {
  Airdrop: manualCliff(start, total * 0.056),
  "Community, other activities": manualLinear(
    start,
    start + periodToSeconds.months(36),
    total * 0.094,
  ),
  "Ecosystem and Network Incentives": [
    manualCliff(start, total * 0.015),
    manualLinear(start, start + periodToSeconds.months(36), total * 0.305),
  ],
  "Foundation Reserves": [
    manualCliff(start, total * 0.02),
    manualLinear(start, start + periodToSeconds.months(36), total * 0.13),
  ],
  "Pre-TGE Purchasers": manualLinear(
    start,
    start + periodToSeconds.months(24),
    total * 0.02,
  ),
  "Private Sale": manualLinear(
    start + periodToSeconds.months(24),
    start + periodToSeconds.months(48),
    total * 0.26,
  ),
  "Core Contributors": manualLinear(
    start + periodToSeconds.months(24),
    start + periodToSeconds.months(72),
    total * 0.1,
  ),
  meta: {
    sources: ["https://polyhedra.foundation/tokenomics"],
    token: "coingecko:polyhedra-network",
    protocolIds: ["5769"],
  },
  categories: {
    airdrop: ["Airdrop"],
    farming: ["Community, other activities","Ecosystem and Network Incentives"],
    noncirculating: ["Foundation Reserves"],
    privateSale: ["Pre-TGE Purchasers","Private Sale"],
    insiders: ["Core Contributors"],
  },
};

export default polyhedra;
