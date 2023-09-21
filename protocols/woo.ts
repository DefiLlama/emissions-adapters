import { manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1603976400;
const qty = 3e9;
const revamp = 1673308800;
const woo: Protocol = {
  Team: [
    manualStep(start, periodToSeconds.month, 48, (qty * 0.1932) / 48),
    manualStep(revamp, periodToSeconds.month, 42, (qty * 0.0068) / 42),
  ],
  Advisors: [
    manualStep(start, periodToSeconds.month, 24, (qty * 0.0158) / 24),
    manualStep(revamp, periodToSeconds.month, 42, (qty * 0.0342) / 42),
  ],
  "Equity Investors": [
    manualStep(start, periodToSeconds.month, 42, (qty * 0.03) / 42),
    manualStep(revamp, periodToSeconds.month, 42, (qty * 0.06) / 42),
  ],
  "Seed Sale": manualStep(
    start,
    periodToSeconds.month,
    24,
    (qty * 0.0857) / 24,
  ),
  "Private Sale": manualStep(
    start,
    periodToSeconds.month,
    6,
    (qty * 0.0827) / 6,
  ),
  "Private Sale 2": manualStep(
    start,
    periodToSeconds.month,
    6,
    (qty * 0.0111) / 6,
  ),
  "Public Sale": manualStep(
    start,
    periodToSeconds.month,
    6,
    (qty * 0.0057) / 6,
  ),
  "Ecosystem Rewards": [
    manualStep(start, periodToSeconds.month, 26, (qty * 0.1948) / 26),
    manualStep(revamp, periodToSeconds.month, 60, (qty * 0.28) / 60),
  ],
  meta: {
    token: "optimism:0x920cf626a271321c151d027030d5d08af699456b",
    sources: [
      "https://woo.org/token",
      "https://woo.org/blog/en/woo-tokenomics-revamp-q1-2023",
      "https://learn.bybit.com/altcoins/what-is-woo-network-token/",
    ],
    protocolIds: ["1461", "2284", "2346"],
    notes: [],
  },
  categories: {},
};

export default woo;
