import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const quantities = {
  investors: 277295070,
  employees: 152704930,
  futureEmployees: 70000000,
};
const dydx: Protocol = {
  "future employees & consultants": [
    //
    manualCliff(1701388800, quantities.futureEmployees * 0.3),
    manualStep(
      1704067200,
      periodToSeconds.month,
      6,
      (quantities.futureEmployees * 0.4) / 6,
    ),
    manualStep(
      1719788400,
      periodToSeconds.month,
      12,
      (quantities.futureEmployees * 0.2) / 12,
    ),
    manualStep(
      1751324400,
      periodToSeconds.month,
      12,
      (quantities.futureEmployees * 0.1) / 12,
    ),
  ],
  "employees and consultants": [
    //
    manualCliff(1701388800, quantities.employees * 0.3),
    manualStep(
      1704067200,
      periodToSeconds.month,
      6,
      (quantities.employees * 0.4) / 6,
    ),
    manualStep(
      1719788400,
      periodToSeconds.month,
      12,
      (quantities.employees * 0.2) / 12,
    ),
    manualStep(
      1751324400,
      periodToSeconds.month,
      12,
      (quantities.employees * 0.1) / 12,
    ),
  ],
  investors: [
    //
    manualCliff(1701388800, quantities.investors * 0.3),
    manualStep(
      1704067200,
      periodToSeconds.month,
      6,
      (quantities.investors * 0.4) / 6,
    ),
    manualStep(
      1719788400,
      periodToSeconds.month,
      12,
      (quantities.investors * 0.2) / 12,
    ),
    manualStep(
      1751324400,
      periodToSeconds.month,
      12,
      (quantities.investors * 0.1) / 12,
    ),
  ],
  "safety module": manualStep(
    1627999200,
    4 * periodToSeconds.week,
    66,
    25000000 / 66,
  ),
  "liquidity module": manualStep(
    1627999200,
    4 * periodToSeconds.week,
    66,
    25000000 / 66,
  ),
  "liquidity provider rewards": manualStep(
    1627999200,
    4 * periodToSeconds.week,
    66,
    75000000 / 66,
  ),
  "trading rewards": manualStep(
    1627999200,
    4 * periodToSeconds.week,
    66,
    250000000 / 66,
  ),
  "DAO treasury": manualCliff(1627999200, 50000000),
  "retroactive mining rewards": manualCliff(1627999200, 75000000),
  meta: {
    sources: [
      "https://docs.dydx.community/dydx-governance/start-here/dydx-allocations",
    ],
    token: "ethereum:0x92d6c1e31e14520e676a687f0a93788b716beff5",
    protocolIds: ["144"],
  },
  categories: {
    insiders: [
      "future employees & consultants",
      "employees and consultants",
      "investors",
    ],
    farming: [
      "safety module",
      "liquidity module",
      "liquidity provider rewards",
      "retroactive mining rewards",
      "trading rewards",
    ],
    noncirculating: ["DAO treasury"],
  },
};
export default dydx;
