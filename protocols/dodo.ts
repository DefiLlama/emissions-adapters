import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { years, months } from "../utils/time";

const qty = 1000000000;
const start = 1597449600;
const token = "0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd";
const chain = "ethereum";

const dodo: Protocol = {
  "Community Incentives": manualCliff(start, qty * 0.6),
  "Team & Consultants": manualLinear(
    years(start, 1),
    years(start, 3),
    qty * 0.15,
  ),
  "Seed Investors": manualLinear(
    years(start, 1),
    years(start, 3),
    qty * 0.06,
  ),
  "Private Round Investors": [
    manualCliff(months(start, 6), qty * 0.1 * 0.1),
    manualLinear(
      months(start, 6),
      months(start, 18),
      qty * 0.1 * 0.9,
    ),
  ],
  IDO: manualCliff(start, qty * 0.01),
  "Operations, Marketing & Partners": manualCliff(start, qty * 0.08),
  meta: {
    sources: [
      "https://docs.dodoex.io/en/home/token-economy"
  ],
    token: `${chain}:${token}`,
    protocolIds: ["parent#dodo"],
    total: qty,
  },
  categories: {
    publicSale: ["IDO"],
    farming: ["Community incentives"],
    privateSale: ["Seed investors", "private round investors"],
    insiders: ["Team & consultants", "Operations, marketing, partners"],
  },
};

export default dodo;
