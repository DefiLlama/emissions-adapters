import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1718150400;
const total = 42e9;

const aethir: Protocol = {
  Team: manualLinear(
    start + periodToSeconds.months(18),
    start + periodToSeconds.months(54),
    total * 0.125,
  ),
  Airdrop: [
    manualCliff(start, total * 0.015),
    manualCliff(start + periodToSeconds.months(8), total * 0.015),
    manualCliff(start + periodToSeconds.months(16), total * 0.03),
  ],
  Investors: manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.115,
  ),
  Advisors: manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.05,
  ),
  "Checkers & Compute Providers": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.5,
  ),
  Ecosystem: [
    manualCliff(start, total * 0.075),
    manualLinear(start, start + periodToSeconds.years(2), total * 0.075),
  ],
  meta: {
    notes: [
      `No Advisors unlock schedule is given, here we have assumed it is the same as the Investors unlock schedule.`,
      `An unknown proportion of Checkers & Compute Providers allocation is released according to Reward Schedules. Here we have used the same 4 year linear unlock as the rest of this allocation.`,
    ],
    token: "coingecko:aethir",
    sources: ["https://docs.aethir.com/aethir-tokenomics/token-overview"],
    protocolIds: ["5591"],
  },
  categories: {
    insiders: ["Team", "Investors", "Advisors"],
    airdrop: ["Airdrop"],
    noncirculating: ["Ecosystem"],
    farming: ["Checkers & Compute Providers"],
  },
};

export default aethir;
