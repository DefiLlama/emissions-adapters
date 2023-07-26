import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = "2021-05-24";
const vestingStart = "2022-05-24";
const rebrand = 1689030000; // July 11 '23

const qty = 1e9;
// rebranded 56.6% through linear vest
// 317 days vest left, extended by a year, gives 682
const aevo: Protocol = {
  "Community Treasury": [
    manualCliff(start, qty * 0.49 * 0.2),
    manualLinear(start, "2024-05-24", qty * 0.49 * 0.8),
  ],
  Team: [
    manualCliff(vestingStart, (qty * 0.23) / 3),
    manualLinear(vestingStart, rebrand, (qty * 0.23 * 2 * 0.566) / 3),
    manualLinear(
      rebrand,
      rebrand + periodToSeconds.day * 682,
      (qty * 0.23 * 2 * 0.434) / 3,
    ),
  ],
  Investors: [
    manualCliff(vestingStart, (qty * 0.15) / 3),
    manualLinear(vestingStart, rebrand, (qty * 0.15 * 2 * 0.566) / 3),
    manualLinear(
      rebrand,
      rebrand + periodToSeconds.day * 682,
      (qty * 0.15 * 2 * 0.434) / 3,
    ),
  ],
  "Corporate Property": manualCliff(start, qty * 0.08),
  "Retroactive Airdrop": manualCliff("2021-05-25", qty * 0.03),
  "Liquidity Mining": manualCliff("2021-06-16", qty * 0.01),
  "Market Makers": manualLinear(
    start,
    start + periodToSeconds.year,
    qty * 0.01,
  ),
  meta: {
    notes: [
      `In the gov proposal in the sources, we have assumed the year added to vesting schedules extends the linear unlock time period.`,
    ],
    token: "ethereum:0x6123b0049f904d730db3c36a31167d9d4121fa6b",
    sources: [
      "https://docs.ribbon.finance/ribbonomics/overview-and-rbn-tokenomics",
      "https://gov.ribbon.finance/t/rgp-33-merge-ribbon-finance-into-aevo/709",
    ],
    protocolIds: ["281"],
  },
  categories: {
    insiders: ["Team", "Investors", "Corporate Property", "Market Makers"],
    noncirculating: ["Community Treasury"],
    airdrop: ["Retroactive Airdrop"],
    farming: ["Liquidity Mining"],
  },
};

export default aevo;
