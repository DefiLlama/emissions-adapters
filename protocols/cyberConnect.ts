import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { balance, latest } from "../adapters/balance";

const qty = 1e8;
const tge = 1692057600;
const chain = "ethereum";
const token = "0x14778860e937f509e651192a90589de711fb88a9";

const cyberConnect: Protocol = {
  "Team & Advisors": manualStep(
    tge + periodToSeconds.month * 15,
    periodToSeconds.month * 3,
    12,
    (qty * 0.15) / 12,
  ),
  "Private Sale": manualStep(
    tge + periodToSeconds.year,
    periodToSeconds.month * 3,
    12,
    (qty * 0.2512) / 12,
  ),
  "Community Treasury": [
    manualCliff(tge, qty * 0.1088 * 0.1),
    manualStep(tge, periodToSeconds.month, 60, (qty * 0.1088 * 0.9) / 60),
  ],
  "Community Rewards": [
    manualCliff(tge, qty * 0.12 * 0.2),
    manualStep(tge, periodToSeconds.month * 3, 12, (qty * 0.12 * 0.8) / 12),
  ],
  "CoinList Public Sale": [
    manualCliff(tge, qty * 0.03 * 0.25),
    manualStep(tge, periodToSeconds.month, 6, (qty * 0.03 * 0.75) / 6),
  ],
  "Ecosystem Partners": [
    manualCliff(tge, qty * 0.09 * 0.2),
    manualStep(tge, periodToSeconds.month, 48, (qty * 0.09 * 0.8) / 48),
  ],
  "Developer Community": [
    manualCliff(tge, qty * 0.1 * 0.05),
    manualStep(tge, periodToSeconds.month, 48, (qty * 0.1 * 0.95) / 48),
  ],
  "Early Integration Partners": [
    manualCliff(tge, qty * 0.05 * 0.1),
    manualStep(tge, periodToSeconds.month, 36, (qty * 0.05 * 0.9) / 36),
  ],
  Marketing: [
    manualCliff(tge, qty * 0.1 * 0.1),
    manualStep(tge, periodToSeconds.month, 36, (qty * 0.1 * 0.9) / 36),
  ],
  meta: {
    sources: [
      "https://link3.to/cyberconnect/post/d430762b4c4a220decb9e8875db78f9af741699774d483d11b9c7203b1582e36",
      "https://www.binance.com/en/research/projects/cyberconnect",
    ],
    token: `${chain}:${token}`,
    protocolIds: ["3702"],
  },
  categories: {
    insiders: [
      "Team and Advisors",
      "Private Sale",
      "Ecosystem Partners",
      "Early Integration Partners",
    ],
    publicSale: ["CoinList Public Sale"],
    noncirculating: ["Community Treasury", "Developer Community", "Marketing"],
    farming: ["Community Rewards"],
  },
};

export default cyberConnect;
