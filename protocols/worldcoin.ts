import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1690153200;
const qty = 1e10;
const token = "0x163f8c2467924be0ae7b5347228cabf260318753";
const chain = "ethereum";

const worldcoin: Protocol = {
  "Market Makers": manualCliff(start, qty * 0.01),
  Community: [
    manualCliff(start, qty * 0.0043),
    manualLinear(start, start + periodToSeconds.year, qty * 0.0357),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.year * 3,
      qty * 0.35,
    ),
    manualLinear(
      start + periodToSeconds.year * 3,
      start + periodToSeconds.year * 6,
      qty * 0.175,
    ),
    manualLinear(
      start + periodToSeconds.year * 6,
      start + periodToSeconds.year * 9,
      qty * 0.0875,
    ),
    manualLinear(
      start + periodToSeconds.year * 9,
      start + periodToSeconds.year * 15,
      qty * 0.0875,
    ),
  ],
  Investors: manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 3,
    qty * 0.135,
  ),
  "Initial Development Team": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 3,
    qty * 0.098,
  ),
  Reserve: manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 3,
    qty * 0.017,
  ),
  meta: {
    token: `${chain}:${token}`,
    sources: [
      "https://whitepaper.worldcoin.org/tokenomics#circulating-supply-at-launch",
    ],
    notes: [],
    protocolIds: [],
  },
  categories: {
    publicSale: ["Community"],
    insiders: ["Market Makers", "Investors", "Initial Development Team"],
    noncirculating: ["Reserve"],
  },
};

export default worldcoin;
