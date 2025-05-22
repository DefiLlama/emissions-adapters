import { manualCliff, manualLinear, manualLog } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1673222400;
const total = 21e8;

const hyperliquid: Protocol = {
  Contributors: manualLinear(
    start + periodToSeconds.months(23),
    start + periodToSeconds.months(72),
    total * 0.15,
  ),
  Users: [
    manualCliff(start, total * 0.25029 * 0.8137),
    manualLinear(
      start,
      start + periodToSeconds.years(2),
      total * 0.25029 * 0.1863,
    ),
  ],
  Reserves: manualCliff(start, total * 0.1),
  Treasury: manualCliff(start, total * 0.095),
  "Node Mining": manualLog(
    start,
    start + periodToSeconds.years(81),
    total * 0.39995,
    periodToSeconds.year,
    3.6,
    true,
  ),
  "Relayer Rewards": manualLinear(
    start,
    start + periodToSeconds.years(81),
    total * 0.00476,
  ),
  meta: {
    token: "coingecko:coredaoorg",
    sources: [
      "https://docs.coredao.org/docs/Learn/economics/core-token/tokenomics-and-utility",
    ],
    protocolIds: ["5382"],
    chain: 'core'
  },
  categories: {
    farming: ["Relayer Rewards", "Users", "Node Mining"],
    insiders: ["Contributors"],
    noncirculating: ["Reserves", "Treasury"],
  },
};
export default hyperliquid;
