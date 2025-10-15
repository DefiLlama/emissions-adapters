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

const eigen: Protocol = {
  // Fixed allocations that don't follow monthly schedule
  "Stakedrops": [
    manualCliff("2024-05-10", 112_970_000), // Season 1: ~113M EIGEN
    manualCliff("2024-09-16", 70_290_000),  // Season 2: ~70.3M EIGEN
    // Fixed at 183.26M after Season 2
  ],
  
  "Inflation": [
    manualCliff("2024-09-29", 7_724_523.084390739), // Initial distribution
    manualCliff("2024-10-03", 1_287_420.5140651232),
    manualCliff("2024-10-04", 1_287_420.5140651232),
    manualCliff("2024-10-10", 1_287_420.5140651232),
    manualCliff("2024-10-17", 1_287_420.5140651232),
    manualStep("2024-10-24", periodToSeconds.week, 152, weeklyInflation), // Regular weekly from Oct 24
  ],
  
  "R&D": [
    manualCliff("2024-09-30", 607_050_893), // Fixed allocation
  ],
  
  meta: {
    notes: [
      "Initial allocation: Community 45%, Investors 29.5%, Early Contributors 25.5%",
      "Stakedrops fixed at 183.26M after Season 2",
      "R&D fixed allocation of 607.05M",
      "Investors: 504.73M monthly unlocks",
      "Early Contributors: 458.55M monthly unlocks",
      "Inflation started Sep 29 2024 with irregular early pattern, then weekly 1,287,420.514 EIGEN",
      "All components complete by October 2027 reaching 1,954.42M total supply (assumes inflation ends before Oct 2027)",
    ],
    token: `${chain}:${token}`,
    sources: [
      "https://docs.eigenfoundation.org/",
      "https://etherscan.io/token/0xec53bf9167f50cdeb3ae105f56099aaab9061f83",
      "Internal unlock schedule data",
    ],
    protocolIds: ["3107"],
  },
  
  categories: {
    publicSale: ["Stakedrops"],
    noncirculating: ["R&D"],
    privateSale: ["Investors"],
    insiders: ["Early Contributors"],
    farming: ["Inflation"],
  },
};

Object.keys(unlockSchedules).forEach((date: string) => {
  Object.keys(unlockSchedules[date]).forEach((category: string) => {
    if (!eigen[category]) {
      eigen[category] = [];
    }
    eigen[category].push(
      manualCliff(date, unlockSchedules[date][category])
    );
  });
});

export default eigen;
