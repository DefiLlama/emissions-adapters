import {
  manualCliff,
  manualLinear,
  manualLog,
  manualStep,
} from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1665529200;
const qty = 2e6;
const token = "0x72953a5c32413614d24c29c84a66ae4b59581bbf";
const chain = "ethereum";

const clev: Protocol = {
  "Liquidity Incentives": manualLog(
    start,
    start + periodToSeconds.year * 10,
    qty * 0.4825,
    periodToSeconds.year,
    10,
    false,
    5,
  ),
  "Community Contributors": manualStep(
    start,
    periodToSeconds.month,
    24,
    (qty * 0.04) / 24,
  ),
  "Treasury Reserve": manualLinear(start, periodToSeconds.year * 2, qty * 0.05),
  IDO: manualCliff(start, qty * 0.05),
  Airdrop: manualLinear(start, start + periodToSeconds.year, qty * 0.05),
  AlladinDAO: manualLinear(start, start + periodToSeconds.year * 2, qty * 0.3),
  "Initial Liquidity": manualCliff(start, qty * 0.01),
  "Strategic Partnerships": manualLinear(
    bribes,
    bribes + periodToSeconds.month * 3,
    qty * 0.015,
  ),
  "Beta bonus": manualCliff(start, 0.0025),
  meta: {
    token: `${chain}:${token}`,
    sources: [
      "https://medium.com/@0xC_Lever/a-clever-token-offering-2d775943e23c",
    ],
    protocolIds: ["1707"],
  },
  categories: {
    insiders: [
      "Strategic Partnerships",
      "AlladinDAO",
      "Community Contributors",
    ],
    farming: ["Liquidity Incentives"],
    airdrop: ["Airdrop", "Beta bonus"],
    publicSale: ["Initial Liquidity", "IDO"],
    noncirculating: ["Treasury Reserve"],
  },
};

export default clev;
