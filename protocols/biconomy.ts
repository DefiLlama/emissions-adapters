import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1637625600;
const qty = 1e9;
const token = "0xf17e65822b568b3903685a7c9f496cf7656cc6c2";
const chain = "ethereum";

const biconomy: Protocol = {
  "Pre Seed Round": manualLinear(
    start + periodToSeconds.month * 9,
    start + periodToSeconds.year * 3,
    qty * 0.06,
  ),
  "Seed Round": manualLinear(
    start + periodToSeconds.month * 9,
    start + periodToSeconds.month * 33,
    qty * 0.0638,
  ),
  "Private Round": [
    manualCliff(start, qty * 0.12 * 0.1),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.month * 30,
      qty * 0.12 * 0.9,
    ),
  ],
  "Strategic Investors": [
    manualCliff(start, qty * 0.005 * 0.1),
    manualLinear(
      start + periodToSeconds.month * 3,
      start + periodToSeconds.month * 15,
      qty * 0.005 * 0.9,
    ),
  ],
  "Public Sale": [
    manualLinear(start, start + periodToSeconds.month * 3, qty * 0.04),
    manualCliff(start, qty * 0.01 * 0.1),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year,
      qty * 0.01 * 0.9,
    ),
  ],
  "Team & Advisors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 3,
    qty * 0.22,
  ),
  Foundation: [
    manualCliff(start, qty * 0.1 * 0.1),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.year * 3,
      qty * 0.1 * 0.9,
    ),
  ],
  "Community Rewards & Incentives": [
    manualCliff(start, qty * 0.3812 * 0.075),
    manualStep(start, periodToSeconds.month, 47, (qty * 0.3812 * 0.925) / 47),
  ],

  meta: {
    token: `${chain}:${token}`,
    sources: [`https://medium.com/biconomy/bico-token-economics-b33ff71f673d`],
    notes: [],
    protocolIds: ["1578"],
  },
  categories: {
    insiders: ["Team & Advisors"],
    privateSale: ["Pre Seed Round","Seed Round", "Private Round", "Strategic Investors"],
    publicSale: ["Public Sale"],
    noncirculating: ["Foundation"],
    farming: ["Community Rewards & Incentives"],
  },
};

export default biconomy;
