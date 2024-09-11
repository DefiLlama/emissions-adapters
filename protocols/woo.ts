import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

// const start = 1603976400;
// const qty = 3e9;
// const revamp = 1673308800;
const woo: Protocol = {
  IEO: manualCliff("2020-10-29", 225e5),
  "Private Round 1": manualLinear("2020-10-29", "2021-04-29", 20419e4),
  "Private Round 2": manualLinear("2020-10-29", "2021-03-29", 33857691),
  "Seed Round": manualLinear("2021-04-21", "2022-10-21", 273973934),
  "Series A and A+": manualLinear("2021-01-11", "2024-01-11", 97468355),
  "Liquidity Management": manualLinear("2020-10-29", "2024-10-29", 15e7),
  "Team & Advisors": manualLinear("2020-10-29", "2024-10-29", 75e7),
  Ecosystem: manualLinear("2020-10-29", "2024-09-04", 1112265597),
  "Private Round 3": manualLinear("2024-03-27", "2024-12-27", 55744423),
  // Team: [
  //   manualStep(start, periodToSeconds.month, 48, (qty * 0.1932) / 48),
  //   manualStep(revamp, periodToSeconds.month, 42, (qty * 0.0068) / 42),
  // ],
  // Advisors: [
  //   manualStep(start, periodToSeconds.month, 24, (qty * 0.0158) / 24),
  //   manualStep(revamp, periodToSeconds.month, 42, (qty * 0.0342) / 42),
  // ],
  // "Equity Investors": [
  //   manualStep(start, periodToSeconds.month, 42, (qty * 0.03) / 42),
  //   manualStep(revamp, periodToSeconds.month, 42, (qty * 0.06) / 42),
  // ],
  // "Seed Sale": manualStep(
  //   start,
  //   periodToSeconds.month,
  //   24,
  //   (qty * 0.0857) / 24,
  // ),
  // "Private Sale": manualStep(
  //   start,
  //   periodToSeconds.month,
  //   6,
  //   (qty * 0.0827) / 6,
  // ),
  // "Private Sale 2": manualStep(
  //   start,
  //   periodToSeconds.month,
  //   6,
  //   (qty * 0.0111) / 6,
  // ),
  // "Public Sale": manualStep(
  //   start,
  //   periodToSeconds.month,
  //   6,
  //   (qty * 0.0057) / 6,
  // ),
  // "Ecosystem Rewards": [
  //   manualStep(start, periodToSeconds.month, 26, (qty * 0.1948) / 26),
  //   manualStep(revamp, periodToSeconds.month, 60, (qty * 0.28) / 60),
  // ],
  meta: {
    token: "ethereum:0x4691937a7508860F876c9c0a2a617E7d9E945D4B",
    sources: [],
    notes: [
      `There are 300m locked tokens whos release is determined by four FDV KPIs. Each time a KPI, 25% will be unlocked. These tokens have been excluded from our analysis here.`,
    ],
    protocolIds: ["1461", "2284", "2346"],
  },
  categories: {
    publicSale: ["IEO", "Liquidity Management"],
    insiders: [
      "Private Round 1",
      "Private Round 2",
      "Private Round 3",
      "Seed Round",
      "Series A and A+",
      "Team & Advisors",
    ],
    farming: ["Ecosystem"],
  },
};

export default woo;
