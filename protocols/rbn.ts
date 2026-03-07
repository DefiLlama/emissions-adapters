import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const totalSupply = 1e10;
const tge = "2024/12/17";

const governance = {
  total: 3e8,
  tgeUnlock: 1e8,
  start: "2025/01/17",
  end: "2027/12/17",
};

const team = {
  total: 1e9,
  start: "2025/12/17",
  end: "2027/12/17",
};

const usydCsiro = {
  total: 2e8,
  start: "2025/06/17",
  end: "2027/12/17",
};

const seed = {
  total: 1.3e9,
  start: "2025/06/17",
  end: "2027/08/17",
};

const privateSaleA = {
  total: 726_712_083,
  start: "2025/02/17",
  end: "2026/01/17",
};

const privateSaleB = {
  total: 689_275_000,
  start: "2025/02/17",
  end: "2025/11/17",
};

const privateSaleC = {
  total: 7e7,
  firstMonthAmount: 7_000_000,
  start: "2025/02/17",
  end: "2025/09/17",
};

const reserve = {
  total: 2e9,
};

const ecosystem = {
  total: 3_714_012_917,
  start: "2024/12/17",
  monthlyAmounts: [
    919_880_129, 26_637_748, 35_679_921, 36_024_365,
    32_618_810, 32_963_254, 33_352_461, 33_196_905,
    33_541_350, 33_885_794, 34_230_238, 34_574_683,
    137_706_816, 40_301_260, 39_826_955, 41_004_733,
    42_182_510, 43_360_288, 44_538_066, 45_371_399,
    46_204_733, 47_038_066, 47_871_399, 48_704_733,
    49_871_399, 51_038_066, 52_204_733, 53_371_399,
    54_538_066, 55_704_733, 56_038_066, 56_371_399,
    56_704_733, 57_038_066, 57_371_399, 57_704_733,
    93_038_066,
  ],
};

function addMonths(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("/").map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}/${String((total % 12) + 1).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
}

const rbn: Protocol = {
  "Governance DAO": [
    manualCliff(tge, governance.tgeUnlock),
    manualLinear(
      governance.start,
      governance.end,
      governance.total - governance.tgeUnlock,
    ),
  ],
  Team: manualLinear(team.start, team.end, team.total),
  "University of Sydney/CSIRO": manualLinear(
    usydCsiro.start,
    usydCsiro.end,
    usydCsiro.total,
  ),
  "Seed Investors": manualLinear(seed.start, seed.end, seed.total),
  "Private Sale A": manualLinear(
    privateSaleA.start,
    privateSaleA.end,
    privateSaleA.total,
  ),
  "Private Sale B": manualLinear(
    privateSaleB.start,
    privateSaleB.end,
    privateSaleB.total,
  ),
  "Private Sale C": [
    manualCliff(tge, privateSaleC.firstMonthAmount),
    manualLinear(
      privateSaleC.start,
      privateSaleC.end,
      privateSaleC.total - privateSaleC.firstMonthAmount,
    ),
  ],
  "Ecosystem & Community": ecosystem.monthlyAmounts.map((amount, i) =>
    manualCliff(addMonths(ecosystem.start, i), amount),
  ),
  meta: {
    token: "coingecko:redbelly-network-token",
    sources: [
      "https://docs.google.com/spreadsheets/d/1BF3GeN-IyvCcgR4fgdd5TNJMp5LOHREtDfuUquq8fT8/edit?usp=sharing",
      "https://medium.com/@redbellyblockchain/redbelly-network-building-the-future-of-tokenomics-with-rbnt-4f1e2667d6ab",
    ],
    protocolIds: [],
    total: totalSupply,
    incompleteSections: [
      {
        key: "Reserve",
        allocation: reserve.total,
        lastRecord: () => 0,
        skipExtrapolation: true,
      },
    ],
    notes: [
      "Total supply is 10 billion RBNT.",
      "Reserve (2B RBNT, 20% of total supply) has no defined release schedule.",
      "Ecosystem & Community amounts are subject to change based on participation rates.",
      "Each monthly period vests linearly from the 17th of one month to the 17th of the next.",
    ],
  },
  categories: {
    noncirculating: ["Governance DAO", "Reserve"],
    insiders: ["Team", "University of Sydney/CSIRO"],
    privateSale: [
      "Seed Investors",
      "Private Sale A",
      "Private Sale B",
      "Private Sale C",
    ],
    farming: ["Ecosystem & Community"],
  },
};

export default rbn;
