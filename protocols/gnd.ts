import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1682290800;
const qty = 100000;
const token = "0xd67a097dce9d4474737e6871684ae3c05460f571";
const chain = "arbitrum";

const gnd: Protocol = {
  Community: manualCliff(start, qty * 0.1),
  Liquidity: manualCliff(start, qty * 0.1),
  //   Treasury: manualCliff(start, qty * 0.15),
  Incentives: manualLinear(start, start + periodToSeconds.year * 5, qty * 0.5),
  Team: manualLinear(start, start + periodToSeconds.year, qty * 0.15),
  meta: {
    token: `${chain}:${token}`,
    sources: [
      "https://gmd-protocol.gitbook.io/gnd-protocol/gnd-token/tokenomics",
    ],
    protocolIds: ["2968"],
    notes: [
      "Treasury (15%) tokens are unlocked on an adhoc basis, therefore they have been excluded from this analysis.",
    ],
  },
  sections: {
    farming: ["Incentives"],
    insiders: ["Team"],
    publicSale: ["Liquidity", "Community"],
    noncirculating: ["Treasury"],
  },
};

export default gnd;
