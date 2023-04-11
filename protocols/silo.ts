import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 1_000_000_000;
const start = 1638316800;

const silo: Protocol = {
  "Genesis protocol-owned liquidity": manualCliff(start, qty * 0.1),
  "Community treasury": manualLinear(
    start,
    start + periodToSeconds.year * 3,
    qty * 0.45,
  ),
  "Early contributors": [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.0675 / 8),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year * 4,
      qty * 0.0675 * 7 / 8,
    ),
  ],
  "Founding contributors": [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.2175 / 6),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year * 3,
      qty * 0.2175 * 5 / 6,
    ),
  ],
  "Early community rewards": manualCliff("2022-01-01", qty * 0.002),
  "Early investors & early advisors": manualLinear(
    start + periodToSeconds.year * 0.5,
    start + periodToSeconds.year * 2.5,
    qty * 0.063,
  ),
  //"Future contributors & future advisors": Linear vesting for 4 years with 1-year cliff starting after joining the DAO
  sources: [
    "https://silopedia.silo.finance/governance/token-allocation-and-vesting",
  ],
  notes: [
    `Future contributors and advisors (10%) have a vesting schedule depending on when they join the DAO. Therefore this secion has been excluded from the analysis.`,
  ],
  token: "ethereum:0x6f80310ca7f2c654691d1383149fa1a57d8ab1f8",
  protocolIds: ["2020"],
};

export default silo;
