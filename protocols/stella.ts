import { Protocol } from "../types/adapters";
import { manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 1e9;
const start = 1604016000;

const stella: Protocol = {
  "Binance Launchpad": manualCliff(start, qty * 0.1),
  "Binance Launchpool": manualCliff(start, qty * 0.05),
  "Private Sale": manualStep(
    start,
    periodToSeconds.month * 3,
    4,
    (qty * 0.1333) / 4,
  ),
  "Liquidity Mining": manualStep(
    start,
    periodToSeconds.month * 3,
    4,
    qty * 0.05,
  ),
  "Team & Advisors": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month * 3,
    10,
    qty * 0.015,
  ),
  Ecosystem: manualStep(
    start,
    periodToSeconds.month * 3,
    24,
    (qty * 0.3667) / 24,
  ),
  meta: {
    sources: [
      "https://docs.stellaxyz.io/stella-doc/tokenomics/token-distribution",
    ],
    token: "ethereum:0xa1faa113cbE53436Df28FF0aEe54275c13B40975",
    protocolIds: ["3148"],
  },
  categories: {
    publicSale: ["Binance Launchpad","Binance Launchpool"],
    farming: ["Liquidity Mining"],
    noncirculating: ["Ecosystem"],
    privateSale: ["Private Sale"],
    insiders: ["Team & Insiders"],
  },
};

export default stella;
