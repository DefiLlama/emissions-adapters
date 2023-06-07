import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { balance, latest } from "../adapters/balance";

const qty = 1000000000;
const start = 1597449600;
const token = "0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd";
const chain = "ethereum";
const timestampDeployed = 1602457200;

const dodo: Protocol = {
  "Team & consultants": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 3,
    qty * 0.15,
  ),
  "Seed investors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 3,
    qty * 0.06,
  ),
  "private round investors": [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.1 * 0.1),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.month * 18,
      qty * 0.1 * 0.9,
    ),
  ],
  IDO: manualCliff(start, qty * 0.01),
  "Operations, marketing, partners": manualCliff(start, qty * 0.08),
  "Community incentives": () =>
    balance(
      ["0x4447183c50e82a8b0141718c405381a3b1bad634"],
      token,
      chain,
      "dodo",
      timestampDeployed,
    ),
  meta: {
    sources: ["https://docs.dodoex.io/english/tokenomics/dodo-allocation"],
    token: `${chain}:${token}`,
    protocolIds: ["146"],
    incompleteSections: [
      {
        key: "Community incentives",
        allocation: qty * 0.6,
        lastRecord: () => latest("dodo", timestampDeployed),
      },
    ],
  },
  categories: {
    insiders: [
      "Team & consultants",
      "Seed investors",
      "private round investors",
      "Operations, marketing, partners",
    ],
    publicSale: ["IDO"],
    noncirculating: ["Community incentives"],
  },
};

export default dodo;
