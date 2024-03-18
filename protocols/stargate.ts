import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { balance, latest } from "../adapters/balance";

const qty = 1000000000;
const start = 1647504000;
const timestampDeployed = 1648252800;
const token = "0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6";
const stargate: Protocol = {
  "core contributors": manualLinear(
    start + periodToSeconds.year,
    start + 3 * periodToSeconds.year,
    0.175 * qty,
  ),
  investors: manualLinear(
    start + periodToSeconds.year,
    start + 3 * periodToSeconds.year,
    0.175 * qty,
  ),
  "STG launch auction purchasers": manualLinear(
    start + periodToSeconds.year,
    start + 1.5 * periodToSeconds.year,
    0.1 * qty,
  ),
  "STG-USDC Curve pool incentives": manualCliff(start, 0.05 * qty),
  "post launch bonding curve": manualCliff(start, 0.1595 * qty),
  "initial emissions program": manualLinear(
    start,
    start + 3 * periodToSeconds.month,
    0.0211 * qty,
  ),
  "STG DEX liquidity": manualCliff(start, 0.0155 * qty),
  "future incentives": () =>
    balance(
      ["0x65bb797c2b9830d891d87288f029ed8dacc19705"],
      token,
      "ethereum",
      "stargate-finance",
      timestampDeployed,
    ),
  meta: {
    sources: [
      "https://stargateprotocol.gitbook.io/stargate/v/user-docs/tokenomics/allocations-and-lockups",
    ],
    token: `ethereum:${token}`,
    protocolIds: ["1571"],
    incompleteSections: [
      {
        key: "future incentives",
        allocation: qty * 0.3039,
        lastRecord: () => latest("stargate-finance", timestampDeployed),
      },
    ],
  },
  categories: {
    insiders: ["core contributors", "investors"],
    farming: [
      "STG-USDC Curve pool incentives",
      "initial emissions program",
      "future incentives",
    ],
    publicSale: ["STG launch auction purchasers", "STG DEX liquidity"],
  },
  total: qty
};

export default stargate;
