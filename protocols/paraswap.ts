import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1636930800;
const qty = 2000000000;

const paraswap: Protocol = {
  Airdrop: manualCliff(start, qty * 0.075),
  "Initial liquidity mining": manualLinear(
    start,
    start + periodToSeconds.year,
    qty * 0.15,
  ),
  Investors: [
    manualCliff(start + periodToSeconds.month * 4, (qty * 0.14) / 6),
    manualLinear(
      start + periodToSeconds.month * 4,
      start + periodToSeconds.year * 2,
      (qty * 0.14 * 5) / 6,
    ),
  ],
  Team: [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.176 * 0.143),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.month * 42,
      qty * 0.176 * 0.857,
    ),
  ],
  "Preseed Investor and Advisors": [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.024 * 0.143),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.month * 42,
      qty * 0.024 * 0.857,
    ),
  ],
  //"Future team members": [], No schedule, need wallet 5%
  Reserves: [
    manualCliff(start, 30000000),
    manualStep(
      start + periodToSeconds.month,
      periodToSeconds.month,
      11,
      20000000,
    ),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      36,
      16660000,
    ),
    manualStep(start + periodToSeconds.year, periodToSeconds.month, 9, 3330000),
  ],
  meta: {
    notes: [
      `Future team members (5%) have no set vesting schedule and therefore has been excluded from this analysis.`,
    ],
    token: "ethereum:0xcafe001067cdef266afb7eb5a286dcfd277f3de5",
    sources: ["https://doc.paraswap.network/psp-token/token-overview"],
    protocolIds: ["894"],
  },
  sections: {
    airdrop: ["Airdrop"],
    insiders: ["Investors", "Team", "Future team members"],
    farming: ["Initial liquidity mining"],
    noncirculating: ["Reserves"],
  },
};

export default paraswap;
