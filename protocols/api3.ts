import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

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
  meta: {
    token: "coingecko:api3",
    sources: [
      "https://medium.com/api3/api3-public-token-distribution-event-1acb3b6d940",
    ],
    notes: [
      `API3 tokens can be staked, giving stakers inflationary staking rewards. Thus, the total amount of 100 Million is not accurate anymore. Rewards are paid out weekly since the introduction of the authoritative DAO in June 2021.`,
    ],
    protocolIds: [],
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
  },
};

export default api3;
