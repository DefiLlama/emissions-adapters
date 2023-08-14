import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1690873200;
const qty = 10000000;

const baseswap: Protocol = {
  "Initial Mint Unlock": manualCliff(start, qty * 0.0205),
  "Liquidity Incentives": manualCliff(start, qty * 0.8545),
  "Treasury & Marketing": manualLinear(
    start,
    start + 2 * periodToSeconds.year,
    0.05 * qty,
  ),
  "Team": manualLinear(
    start,
    start + 2 * periodToSeconds.year,
    0.05 * qty,
  ),
  "Initial Mint Lock": manualLinear(
    start,
    start + 1 * periodToSeconds.month,
    0.025 * qty,
  ),
  meta: {
    notes: [
      `We have divided the Inicial Mint field into unlocked and locked.`,
      `Liquidity Incentives. emissions are based on tvl/volume (between 0.08s-0.01)`,
    ],
    token: "base:0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9",
    sources: ["https://base-swap-1.gitbook.io/baseswap/baseswap/bswap"],
    protocolIds: ["3333"],
  },
  categories: {
    insiders: ["Team"],
    publicSale: ["Initial Mint Unlock", "Initial Mint Lock"],
    farming: ["Liquidity Incentives"],
    noncirculating: ["Treasury & Marketing"]
  },
};
export default baseswap;