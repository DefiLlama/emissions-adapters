import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const token = "0xec53bF9167f50cDEB3Ae105f56099aaaB9061F83";
const chain = "ethereum";
const start = 1727654400; // 30/09/2024
const weeklyInflation = 1_287_420.5140651232; // Weekly inflation amount

const unlockSchedules: { [date: string]: { [category: string]: number } } = {
  "2025-10-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 21_697_690.05,
  },
  "2025-11-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 21_672_750.11,
  },
  "2025-12-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 21_594_263.19,
  },
  "2026-01-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 21_481_174.24,
  },
  "2026-02-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 21_275_068.58,
  },
  "2026-03-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 20_938_187.70,
  },
  "2026-04-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 20_566_147.69,
  },
  "2026-05-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 20_351_804.43,
  },
  "2026-06-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 20_185_416.18,
  },
  "2026-07-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 19_878_307.81,
  },
  "2026-08-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 19_698_418.08,
  },
  "2026-09-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 19_299_695.25,
  },
  "2026-10-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 18_835_879.83,
  },
  "2026-11-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 17_636_368.53,
  },
  "2026-12-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 16_605_781.69,
  },
  "2027-01-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 15_818_231.11,
  },
  "2027-02-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 15_676_329.61,
  },
  "2027-03-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 15_667_300.61,
  },
  "2027-04-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 15_667_300.61,
  },
  "2027-05-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 15_667_300.61,
  },
  "2027-06-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 15_667_300.61,
  },
  "2027-07-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 15_667_300.61,
  },
  "2027-08-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 15_667_300.61,
  },
  "2027-09-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 15_667_300.61,
  },
  "2027-10-01": {
    "Investors": 20_189_049.87,
    "Early Contributors": 15_667_300.61,
  },
};

// PI (Programmatic Incentives) weekly amounts
const weeklyPI_v1 = 1_287_420.5140651232; // ended
const weeklyPI_v2 = 2_356_969.864211533;  // ongoing

// Unlock dates (Oct 2025 - Oct 2027, 25 months)
const unlockDates = [
  "2025-10-01", "2025-11-01", "2025-12-01",
  "2026-01-01", "2026-02-01", "2026-03-01", "2026-04-01", "2026-05-01", "2026-06-01",
  "2026-07-01", "2026-08-01", "2026-09-01", "2026-10-01", "2026-11-01", "2026-12-01",
  "2027-01-01", "2027-02-01", "2027-03-01", "2027-04-01", "2027-05-01", "2027-06-01",
  "2027-07-01", "2027-08-01", "2027-09-01", "2027-10-01",
];

// Investors: 504.73M total
const investorAmounts = [
  20_189_049.87, 20_189_049.87, 20_189_049.87, 20_189_049.87, 20_189_049.87,
  20_189_049.87, 20_189_049.87, 20_189_049.87, 20_189_049.87, 20_189_049.87,
  20_189_049.87, 20_189_049.87, 20_189_049.87, 20_189_049.87, 20_189_049.87,
  20_189_049.87, 20_189_049.87, 20_189_049.87, 20_189_049.87, 20_189_049.87,
  20_189_049.87, 20_189_049.87, 20_189_049.87, 20_189_049.87, 20_189_049.87,
];

// Foundation: 75M total
const foundationAmounts = [
  3_000_000.00, 3_000_000.00, 3_000_000.00, 3_000_000.00, 3_000_000.00,
  3_000_000.00, 3_000_000.00, 3_000_000.00, 3_000_000.00, 3_000_000.00,
  3_000_000.00, 3_000_000.00, 3_000_000.00, 3_000_000.00, 3_000_000.00,
  3_000_000.00, 3_000_000.00, 3_000_000.00, 3_000_000.00, 3_000_000.00,
  3_000_000.00, 3_000_000.00, 3_000_000.00, 3_000_000.00, 3_000_000.00,
];

// Insiders: 383.55M total
const insiderAmounts = [
  18_697_690.05, 18_672_750.10, 18_594_263.19, 18_481_174.24, 18_275_068.58,
  17_938_187.70, 17_566_147.69, 17_351_804.43, 17_185_416.19, 16_878_307.81,
  16_698_418.08, 16_299_695.25, 15_835_879.83, 14_636_368.53, 13_605_781.69,
  12_818_231.11, 12_676_329.61, 12_667_300.61, 12_667_300.61, 12_667_300.61,
  12_667_300.61, 12_667_300.61, 12_667_300.61, 12_667_300.61, 12_667_300.61,
];

const eigenlayer: Protocol = {
  // Stakedrops (already circulating)
  "Stakedrops": [
    manualCliff("2024-05-10", 112_970_000), // Season 1
    manualCliff("2024-09-16", 70_290_000),  // Season 2
  ],
  
  // Programmatic Incentives (PI) - ongoing
  "Programmatic Incentives": [
    manualCliff("2024-09-29", 7_724_523.084390739),
    manualCliff("2024-10-03", weeklyPI_v1),
    manualCliff("2024-10-04", weeklyPI_v1),
    manualCliff("2024-10-10", weeklyPI_v1),
    manualCliff("2024-10-17", weeklyPI_v1),
    manualStep("2024-10-24", periodToSeconds.week, 50, weeklyPI_v1), // PI v1 (ended)
    manualStep("2025-10-09", periodToSeconds.week, 52, weeklyPI_v2), // PI v2 (ongoing, ~1 year)
  ],
  
  // Investors: 504.73M total
  "Investors": unlockDates.map((date, i) => manualCliff(date, investorAmounts[i])),
  
  // Foundation: 75M total
  "Foundation": unlockDates.map((date, i) => manualCliff(date, foundationAmounts[i])),
  
  // Insiders: 383.55M total
  "Insiders": unlockDates.map((date, i) => manualCliff(date, insiderAmounts[i])),
  
  meta: {
    notes: [
      "Stakedrops: 183.26M",
      "PI v1: 1,287,420 EIGEN/week (ended)",
      "PI v2: 2,356,969 EIGEN/week (ongoing)",
      "Investors: 504.73M total",
      "Foundation: 75M total",
      "Insiders: 383.55M total",
    ],
    token: `${chain}:${token}`,
    sources: [
      "https://docs.eigenfoundation.org/",
      "https://economy.eigencloud.xyz/api/eigen/circulating-supply",
      "https://economy.eigencloud.xyz/api/eigen/total-supply",
    ],
    protocolIds: ["3107"],
  },
  
  categories: {
    publicSale: ["Stakedrops"],
    privateSale: ["Investors"],
    noncirculating: ["Foundation"],
    insiders: ["Insiders"],
    farming: ["Programmatic Incentives"],
  },
};

export default eigenlayer;

