import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1680703200;
const qty = 500000000;

const agility: Protocol = {
  "Initial Liquidity": manualCliff(start, qty * 0.01),
  Treasury: manualLinear(start, start + periodToSeconds.year * 3, qty * 0.1),
  Marketing: manualCliff(start, qty * 0.01),
  "Liquidity Incentive": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    qty * 0.88,
  ),
  meta: {
    notes: [
      `The team was no token allocation`,
      "Marketing shares will only be used for CEX liquidity and Market Maker. It will be stored in an independent and transparent address.",
    ],
    token: "ethereum:0x5F18ea482ad5cc6BC65803817C99f477043DcE85",
    sources: ["https://docs.agilitylsd.com/tokenomics"],
    protocolIds: ["2817"],
  },
  categories: {
    farming: ["Liquidity Incentive"],
    insiders: ["Marketing"],
    noncirculating: ["Treasury"],
    publicSale: ["Initial Liquidity"],
  },
};

export default agility;
