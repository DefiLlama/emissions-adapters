import distribution from "../adapters/euler";
import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1640995200;
const cliff = 1640995200;

const euler: Protocol = {
  treasury: manualCliff(start, 3759791),
  "early users": manualCliff(start, 271828),
  "user incentives": distribution(),
  shareholders: manualLinear(
    cliff,
    cliff + periodToSeconds.month * 18,
    7026759,
  ),
  "DAO partners": manualLinear(
    cliff,
    cliff + periodToSeconds.month * 18,
    2628170,
  ),
  "Encode incubator": manualLinear(
    cliff,
    cliff + periodToSeconds.month * 30,
    1087313,
  ),
  "employees, advisors, consultants": manualLinear(
    cliff,
    cliff + periodToSeconds.month * 48,
    5613252,
  ),
  meta: {
    sources: ["https://docs.euler.finance/eul/about"],
    token: "ethereum:0xd9fcd98c322942075a5c3860693e9f4f03aae07b",
    notes: [
      `within the 'employees, advisors, consultants' section, co-founders have a 48 month linear unlock schedule, while all others have undisclosed individual agreements. Here we have shown the whole section to have the same schedule as co-founders.`,
    ],
    protocolIds: ["1183"],
  },
  categories: {
    insiders: [
      "employees, advisors, consultants",
      "Encode incubator",
      "DAO partners",
      "shareholders",
    ],
    farming: ["user incentives"],
    airdrop: ["early users"],
    noncirculating: ["treasury"],
  },
};
export default euler;
