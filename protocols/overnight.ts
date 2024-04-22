import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const qty = 1e6;
const start = 1694044800;
const presaleEnd = 1695600000;
const overnight: Protocol = {
  "Pre Seed": [
    manualCliff(start + periodToSeconds.months(6), (qty * 0.085) / 5),
    manualLinear(
      presaleEnd + periodToSeconds.months(6),
      presaleEnd + periodToSeconds.months(30),
      (qty * 0.085 * 4) / 5,
    ),
  ],
  Team: [
    manualCliff(start + periodToSeconds.months(6), (qty * 0.25) / 5),
    manualLinear(
      presaleEnd + periodToSeconds.months(6),
      presaleEnd + periodToSeconds.months(30),
      (qty * 0.25 * 4) / 5,
    ),
  ],
  Presale: [
    manualCliff(presaleEnd, (qty * 0.025) / 4),
    manualLinear(
      presaleEnd + periodToSeconds.days(5),
      presaleEnd + +periodToSeconds.days(5) + periodToSeconds.weeks(4),
      (qty * 0.025 * 3) / 4,
    ),
  ],
  "Insurance Fund": [
    manualCliff(presaleEnd, qty * 0.02),
    manualLinear(
      presaleEnd,
      presaleEnd + periodToSeconds.months(6),
      qty * 0.18,
    ),
  ],
  Treasury: [
    manualCliff(presaleEnd, qty * 0.044),
    manualLinear(
      presaleEnd,
      presaleEnd + periodToSeconds.months(6),
      qty * 0.396,
    ),
  ],
  meta: {
    sources: [
      "https://docs.overnight.fi/governance/ovn-token/overnight-tokenomics",
    ],
    token: "base:0xa3d1a8deb97b111454b294e2324efad13a9d8396",
    protocolIds: ["1023", "2696", "2810", "3631"],
  },
  categories: {
    insiders: ["Pre Seed", "Team"],
    noncirculating: ["Treasury", "Insurance Fund"],
    publicSale: ["Presale"],
  },
};

export default overnight;
