import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1647734400;
const qty = 10000000000;
const benddao: Protocol = {
  team: manualLinear(
    start + 14 * periodToSeconds.month,
    start + 14 * periodToSeconds.month + 3 * periodToSeconds.year,
    qty * 0.21,
  ),
  "fair launch offering": manualCliff(start, qty * 0.1),
  treasury: manualCliff(start, qty * 0.21),
  airdrop: manualCliff(start, qty * 0.05),
  "Uniswap LP incentive": manualLinear(
    1651060800,
    1651060800 + 3 * periodToSeconds.year,
    qty * 0.03,
  ),
  "Lend/Borrow Incentive": manualLinear(
    start,
    start + 5 * periodToSeconds.year,
    0.4 * qty,
  ),
  meta: {
    token: "ethereum:0x0d02755a5700414b26ff040e1de35d337df56218",
    sources: ["https://docs.benddao.xyz/portal/governance/bendenomics"],
    protocolIds: ["1773", "2554"],
  },
  sections: {
    insiders: ["team"],
    airdrop: ["airdrop"],
    farming: ["Uniswap LP incentive", "Lend/Borrow Incentive"],
    noncirculating: ["treasury"],
    publicSale: ["fair launch offering"],
  },
};

export default benddao;
