import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1671840000;
const qty = 50000000;

const vela: Protocol = {
  Incentives: manualLinear(start, start + periodToSeconds.year * 20, qty * 0.3),
  "Growth fund": manualLinear(
    start,
    start + periodToSeconds.year * 20,
    qty * 0.19,
  ),
  Marketing: manualLinear(start, start + periodToSeconds.year * 20, qty * 0.05),
  Team: manualLinear(
    start + periodToSeconds.month * 6,
    start + periodToSeconds.month * 42,
    qty * 0.165,
  ),
  "Bridged DXP": manualCliff(start, qty * 0.18),
  "Investors & partners": manualCliff(start, qty * 0.05),
  Advisors: manualLinear(
    start + periodToSeconds.month * 6,
    start + periodToSeconds.month * 18,
    qty * 0.02,
  ),
  meta: {
    notes: [
      `no emission schedule is given for incentives, growth fund, marketing, so we've interpolated their maximum yearly emissions.`,
    ],
    token: "arbitrum:0x088cd8f5ef3652623c22d48b1605dcfe860cd704",
    sources: [
      "https://vela-exchange.gitbook.io/vela-knowledge-base/token-economy/usdvela-distribution",
    ],
    protocolIds: ["2548"],
  },
  sections: {
    insiders: ["Team", "Investors & partners", "Advisors"],
  },
};

export default vela;
