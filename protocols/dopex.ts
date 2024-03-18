import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { balance, latest } from "../adapters/balance";

const qty = 500000;
const start = 1633647600;
const token = "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55";
const timestampDeployed = 1655766000;
const chain = "arbitrum";

const dopex: Protocol = {
  Treasury: () =>
    balance(
      ["0x2fa6f21ecfe274f594f470c376f5bdd061e08a37"],
      token,
      chain,
      "dopex",
      timestampDeployed,
    ),
  // "Operational allocation": manualLinear(
  //   start,
  //   start + periodToSeconds.year * 5,
  //   qty * 0.17,
  // ),
  Farming: manualLinear(start, start + periodToSeconds.year * 2, qty * 0.15),
  // "Platform rewards": manualLinear(
  //   start,
  //   start + periodToSeconds.year * 5,
  //   qty * 0.3,
  // ),
  Founders: [
    manualCliff(start, qty * 0.12 * 0.2),
    manualLinear(start, start + periodToSeconds.year * 2, qty * 0.12 * 0.8),
  ],
  "Early investors": manualLinear(
    start,
    start + periodToSeconds.year / 2,
    qty * 0.11,
  ),
  "Token sale": manualCliff(start, qty * 0.15),
  meta: {
    sources: ["https://docs.dopex.io/tokenomics/tokenomics"],
    token: `${chain}:${token}`,
    protocolIds: ["660"],
    total: qty,
    incompleteSections: [
      {
        key: "Treasury",
        allocation: qty * 0.47,
        lastRecord: () => latest("dopex", timestampDeployed),
      },
    ],
  },
  categories: {
    insiders: ["Founders", "Early investors", "Operational allocations"],
    farming: ["Farming", "Platform rewards"],
    publicSale: ["Token sale"],
    noncirculating: ["Treasury"],
  },
};

export default dopex;
