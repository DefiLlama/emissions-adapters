import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";
import { stakingRewards, epochsTracked } from "../adapters/api3";
const start = 1606741200;
const qty = 100000000;

const api3: Protocol = {
  "Founding Team": [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.05),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year * 3,
      qty * 0.25,
    ),
  ],
  "Partners & Contributors": [
    manualCliff(start + periodToSeconds.month * 6, qty * (0.1 / 6)),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year * 3,
      qty * (0.5 / 6),
    ),
  ],
  "Pre-seed Investors": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    qty * 0.05,
  ),
  "Seed Investors": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    qty * 0.1,
  ),
  "Ecosystem Fund": manualCliff(start, qty * 0.25),
  "Public distribution": manualCliff(start, qty * 0.2),
  "Staking rewards": () => stakingRewards(),
  meta: {
    token: "coingecko:api3",
    sources: [
      "https://medium.com/api3/api3-public-token-distribution-event-1acb3b6d940",
      `Inflationary staking rewards has no set allocation. In this analysis we can only look at past unlocks.`,
    ],
    protocolIds: [],
    custom: {
      latestEpoch: () => epochsTracked(),
    },
  },
  sections: {
    insiders: [
      "Founding Team",
      "Partners & Contributors",
      "Pre-seed Investors",
      "Seed Investors",
    ],
    noncirculating: ["Ecosystem Fund"],
    publicSale: ["Public distribution"],
    farming: ["Staking rewards"],
  },
  incompleteSections: [{ key: "Staking rewards", allocation: undefined }],
};

export default api3;
