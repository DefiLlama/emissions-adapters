import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1680091200;
const qty = 100000000;

const OT: Protocol = {
  IFO: manualCliff(start, qty * 0.1),
  "Community Incentive": manualLinear(
    start,
    start + periodToSeconds.year * 5,
    qty * 0.45,
  ),
  Team: manualLinear(
    start + periodToSeconds.month * 3,
    start + periodToSeconds.month * 27,
    qty * 0.2,
  ),
  "Partnerships & Marketing": manualLinear(
    start,
    start + periodToSeconds.year * 1,
    qty * 0.05,
  ),
  "Initial Liquidity": manualCliff(start, qty * 0.025),
  Treasury: manualCliff(start, qty * 0.175),
  meta: {
    notes: [
      `Treasury can be sold at anytime`,
      "Team Locked for the first 3 months. Than linear in the next 24 months",
    ],
    token: "0xD0eA21ba66B67bE636De1EC4bd9696EB8C61e9AA",
    sources: [
      "https://onchaintrade.gitbook.io/ot/tokenomics/tokenomics-zksync-era",
    ],
    protocolIds: ["2752"],
  },
  categories: {
    insiders: ["Team", "Partnerships & Marketing"],
    publicSale: ["IFO", "Initial Liquidity"],
    farming: ["Community Incentive"],
    noncirculating: ["Treasury"],
  },
};

export default OT;
