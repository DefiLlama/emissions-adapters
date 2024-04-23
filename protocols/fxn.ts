import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualLog } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const total = 2e6;
const start = 1694995200;
const fxn: Protocol = {
  "Liquidity Incentives": manualLog(
    start,
    start + periodToSeconds.years(50),
    total * 0.49,
    periodToSeconds.year,
    10,
    true,
    5,
  ),
  "Community Contributors": [
    manualLinear(start, start + periodToSeconds.year, total * 0.015),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(2),
      total * 0.01,
    ),
    manualLinear(
      start + periodToSeconds.years(2),
      start + periodToSeconds.years(3),
      total * 0.005,
    ),
  ],
  "Treasury Reserve": manualLinear(
    start,
    start + periodToSeconds.years(2),
    total * 0.1,
  ),
  IDO: manualCliff(start, total * 0.05),
  "Testnet/Beta/IDO Users": manualLinear(
    start,
    start + periodToSeconds.year,
    total * 0.005,
  ),
  "veCLEV Holders": manualLinear(
    start,
    start + periodToSeconds.year,
    total * 0.0025,
  ),
  "veCTR Holders": manualLinear(
    start,
    start + periodToSeconds.year,
    total * 0.0025,
  ),
  "Alladin DAO": manualLinear(
    start,
    start + periodToSeconds.years(2),
    total * 0.3,
  ),
  "Initial Liquidity": manualCliff(start, total * 0.01),
  "Strategic Parnerships": manualLinear(
    start,
    start + periodToSeconds.year,
    total * 0.01,
  ),
  meta: {
    sources: ["https://docs.aladdin.club/f-x-protocol/tokenomics"],
    token: "ethereum:0x365accfca291e7d3914637abf1f7635db165bb09",
    protocolIds: ["3344"],
  },
  categories: {
    farming: ["Liquidity Incentives"],
    insiders: [
      "Community Contributors",
      "Strategic Parnerships",
      "Alladin DAO",
    ],
    noncirculating: ["Treasury Reserve"],
    publicSale: ["IDO", "Initial Liquidity"],
    airdrop: ["Testnet/Beta/IDO Users", "veCLEV Holders", "veCTR Holders"],
  },
};
export default fxn;
