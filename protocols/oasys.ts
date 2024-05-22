import { manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1670803200;
const total = 1e10;

const oasys: Protocol = {
  "Ecosystem & Community": manualLinear(
    start,
    start + periodToSeconds.months(70),
    total * 0.38,
  ),
  "Staking Rewards": manualLinear(
    start,
    start + periodToSeconds.months(72),
    total * 0.21,
  ),
  Development: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(30),
    total * 0.15,
  ),
  "Early Backers": manualLinear(
    start + periodToSeconds.months(12),
    start + periodToSeconds.months(36),
    total * 0.14,
  ),
  Foundation: manualLinear(
    start + periodToSeconds.months(12),
    start + periodToSeconds.months(36),
    total * 0.12,
  ),
  meta: {
    sources: ["https://docs.oasys.games/docs/whitepaper/tokenomics"],
    token: "coingecko:oasys",
    notes: [
      `In this analysis we have inferred from the chart that Staking Rewards and Ecosystem & Community sections will use a linear unlock schedule.`,
    ],
    protocolIds: ["4649"],
  },
  categories: {
    farming: ["Ecosystem & Community", "Staking Rewards"],
    insiders: ["Development", "Early Backers"],
    noncirculating: ["Foundation"],
  },
};
export default oasys;
