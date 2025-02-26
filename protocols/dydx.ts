import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const quantities = {
  investors: 277_295_070,
  employees: 152_704_930,
  futureEmployees: 70000000,
};

const timestamps = {
  epoch0: "2021-08-03",
  start: "2021-09-08",
  dip16: "2022-07-05", // "2022-07-31"
  dip17: "2022-10-25", // "2022-10-29"
  dip20: "2023-02-14", // "2023-02-27"
  dip24: "2023-07-04", // "2023-07-18"
  epoch30: "2023-11-21",
  epoch31: "2023-12-19",
};

const epoch = periodToSeconds.weeks(4);
const dydx: Protocol = {
  "Community Treasury": manualLinear(
    timestamps.epoch0,
    "2022-10-01",
    50_000_000 + 24_690_803,
  ), // (50_000_000 + 24_690_803) / 2.04 = 424 days
  "Rewards Treasury": manualLinear(
    timestamps.epoch0,
    "2025-06-13",
    165_136_991 + 43_356_160 + 20_013_694 + 18_479_446,
  ), // (165,136,991 + 43,356,160 + 20,013,694 + 18,479,446) / 2.04 = 1410 days
  "Trading Rewards": [
    manualStep(timestamps.epoch0, epoch, 12, 3_835_616),
    manualStep(timestamps.dip16, epoch, 8, 2_876_712),
    manualStep(timestamps.dip20, epoch, 9, 1_582_192),
    manualCliff(timestamps.epoch30, 1_054_795),
    manualCliff(timestamps.epoch31, 527_398),
  ], // 250,000,000 => reaminder to Rewards Treasury
  "Retroactive Mining Rewards": manualCliff(timestamps.epoch0, 50_309_197), // 75,000,000 => 24,690,803 to community treasury
  "Liquidity Provider Rewards": [
    manualStep(timestamps.epoch0, epoch, 25, 1_150_685),
    manualStep(timestamps.dip24, epoch, 4, 575_343),
    manualCliff(timestamps.epoch30, 383_562),
    manualCliff(timestamps.epoch31, 191_781),
  ], // 75,000,000 => reaminder to Rewards Treasury
  "Liquidity Staking Pool": manualStep(
    timestamps.epoch0,
    periodToSeconds.weeks(4),
    13,
    383_562,
  ), // 25,000,000 => reaminder to Rewards Treasury
  "Safety Staking Pool": manualStep(
    timestamps.epoch0,
    periodToSeconds.weeks(4),
    17,
    383_562,
  ), // 25,000,000 => reaminder to Rewards Treasury
  "Past Investors": [
    manualCliff("2023-12-01", quantities.investors * 0.3),
    manualStep(
      "2023-12-01",
      periodToSeconds.month,
      6,
      (quantities.investors * 0.4) / 6,
    ),
    manualStep(
      "2024-06-01",
      periodToSeconds.month,
      12,
      (quantities.investors * 0.2) / 12,
    ),
    manualStep(
      "2025-06-01",
      periodToSeconds.month,
      12,
      (quantities.investors * 0.1) / 12,
    ),
  ],
  "Founders, Employees, Advisors & Consultants": [
    manualCliff("2023-12-01", quantities.employees * 0.3),
    manualStep(
      "2023-12-01",
      periodToSeconds.month,
      6,
      (quantities.employees * 0.4) / 6,
    ),
    manualStep(
      "2024-06-01",
      periodToSeconds.month,
      12,
      (quantities.employees * 0.2) / 12,
    ),
    manualStep(
      "2025-06-01",
      periodToSeconds.month,
      12,
      (quantities.employees * 0.1) / 12,
    ),
  ],
  "Future Employees & Consultants": [
    manualCliff("2023-12-01", quantities.futureEmployees * 0.3),
    manualStep(
      "2023-12-01",
      periodToSeconds.month,
      6,
      (quantities.futureEmployees * 0.4) / 6,
    ),
    manualStep(
      "2024-06-01",
      periodToSeconds.month,
      12,
      (quantities.futureEmployees * 0.2) / 12,
    ),
    manualStep(
      "2025-06-01",
      periodToSeconds.month,
      12,
      (quantities.futureEmployees * 0.1) / 12,
    ),
  ],
  meta: {
    sources: [
      "https://docs.dydx.community/dydx-unlimited/start-here/dydx-token-allocation",
    ],
    token: "coingecko:dydx-chain",
    protocolIds: ["144"],
    total: 1e9,
  },
  categories: {
    insiders: [
      "Future Employees & Consultants",
      "Founders, Employees, Advisors & Consultants",
      "Past Investors",
    ],
    farming: [
      "Safety Staking Pool",
      "Liquidity Staking Pool",
      "Liquidity Provider Rewards",
      "Trading Rewards",
    ],
    airdrop: ["Retroactive Mining Rewards"],
    noncirculating: ["Rewards Treasury", "Community Treasury"],
  },
};
export default dydx;
