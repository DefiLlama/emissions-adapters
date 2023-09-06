import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1496188800; // Wednesday, 31 May 2017 00:00:00
const qty = 1500000000; // 1.5b
const end = 1761868800 // 31 October 2025 00:00:00

const basic: Protocol = {
  "Investor": manualCliff(start, qty * 0.6667),
  "User Growth Pool": manualCliff(start, qty * 0.20),
  "Brave": [manualCliff(start + periodToSeconds.month, qty * 0.1333), manualCliff(end, qty * 0)],
  meta: {
    notes: [
      `The supply of Basic Attention Token (BAT) has fully vested.`,
    ],
    token: "ethereum:0x0d8775f648430679a709e98d2b0cb6250d2887ef",
    sources: ["https://basicattentiontoken.org/static-assets/documents/BasicAttentionTokenWhitePaper-4.pdf"],
    protocolIds: ["3490"],
  },
  categories: {
    insiders: [],
    publicSale: ["Investor"],
    farming: ["Brave", "User Growth Pool"]
  },
};
export default basic;