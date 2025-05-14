import { Protocol } from "../types/adapters";
import { manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { balance, latest } from "../adapters/balance";

const chain = "ethereum";
const token = "0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce";
const total = 62434008330;
const start = 1634943600;

const beam: Protocol = {
  "Merit Circle Treasury Funds": manualLinear(start, 1714052911, 27122501974),
  Treasury: (backfill: boolean) =>
    balance(
      ["0x7e9e4c0876B2102F33A1d82117Cc73B7FddD0032"],
      token,
      chain,
      "beam",
      1697497200,
      backfill,
    ),
  "Contributors & Builders": manualLinear(
    start,
    start + periodToSeconds.months(54),
    total * 0.24,
  ),
  "Seed Contributors": manualLinear(
    start,
    start + periodToSeconds.months(42),
    total * 0.141,
  ),
  meta: {
    sources: [
      "https://meritcircle.gitbook.io/merit-circle/usdbeam-token/token-distribution",
    ],
    notes: [
      `Treasury funds spent before migration from MC to BEAM have been interpolated with a linear schedule.`,
    ],
    token: `${chain}:${token}`,
    protocolIds: ["1048", "4522"],
    incompleteSections: [
      {
        key: "Treasury",
        allocation: total * 0.1846,
        lastRecord: (backfill: boolean) => latest("beam", 1697497200, backfill),
      },
    ],
    total,
  },
  categories: {
    insiders: ["Seed Contributors", "Contributors & Builders"],
    noncirculating: ["Treasury"],
  },
};
export default beam;
