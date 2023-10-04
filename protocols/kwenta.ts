import { manualCliff } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1668038400;
const qty = 313373;

const inflation = (portion: number) => {
  let amount: number = 14463.37 * portion;
  let thisStart: number = start;
  const sections: CliffAdapterResult[] = [];
  for (let i = 0; i < 52 * 4; i++) {
    sections.push({ type: "cliff", amount, start: thisStart });
    thisStart += periodToSeconds.week;
    amount *= 0.98;
  }
  return sections;
};

const kwenta: Protocol = {
  Treasury: [inflation(0.2), manualCliff(start, 0.2 * qty)],
  "Core Contributors": manualCliff(start, 0.15 * qty),
  "Growth Fund": manualCliff(start, 0.25 * qty),
  Investment: manualCliff(start, 0.05 * qty),
  "Early Users": manualCliff(start, 0.05 * qty),
  "SNX Stakers": manualCliff(start, 0.3 * qty),
  Stakers: inflation(0.6),
  "Trading Rewards": inflation(0.15),
  meta: {
    token: "optimism:0x920cf626a271321c151d027030d5d08af699456b",
    sources: ["https://docs.kwenta.io/dao/kwenta-tokenomics"],
    protocolIds: ["2981"],
    notes: [
      `From "14,463.37 $KWENTA the first week and drop to around 200 $KWENTA at the end of four years" we have inferred a decay of 2% a week`,
      "KWENTA can be vested immediately for a 90% penalty. This penalty decreases linearly to 0% after 1 year. As we can't tell how many, and when, vesters will exit early, we have excluded this mechanism from our analysis.",
    ],
  },
  categories: {},
};

export default kwenta;
