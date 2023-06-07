import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { unallocated, latest } from "../adapters/forta";

const nonCommunity = (percentage: number) => [
  manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 4,
    totalQty * percentage * 0.75,
  ),
  manualCliff(start + periodToSeconds.year, totalQty * percentage * 0.25),
];
const totalQty = 1000000000;
const start = 1627776000;
const forta: Protocol = {
  airdrop: manualCliff(start, totalQty * 0.04),
  "node runner rewards": manualCliff(start, totalQty * 0.002),
  other: [
    manualCliff(start, totalQty * 0.01),
    manualCliff(start + periodToSeconds.year * 2, totalQty * 0.012),
  ],
  unallocated: () => unallocated(),
  backers: nonCommunity(0.245),
  "core contributors": nonCommunity(0.2),
  OpenZeppelin: nonCommunity(0.1),
  meta: {
    sources: ["https://docs.forta.network/en/latest/fort-token/"],
    token: "ethereum:0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29",
    protocolIds: ["2664"],
    incompleteSections: [
      {
        key: "unallocated",
        allocation: totalQty * 0.391,
        lastRecord: () => latest(),
      },
    ],
  },
  categories: {
    insiders: ["other", "backers", "core contributors", "OpenZeppelin"],
    airdrop: ["airdrop"],
    farming: ["node runner rewards"],
    noncirculating: ["unallocated"],
  },
};
export default forta;
