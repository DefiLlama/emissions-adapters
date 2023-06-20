import { LinearAdapterResult, Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 500e6;
const mainnet = 1585008000;
const unlock = mainnet + periodToSeconds.month * 9;
const purchaser = qty * 0.372;
const foundersUnlock = 1609977600;

const inflation = () => {
  const sections: LinearAdapterResult[] = [];
  const allocation = qty * 0.339;
  const disinflationRate = 0.15;

  let inflationRate = 8;
  let start = mainnet;
  let total = qty;
  let workingQty = 0;

  while (inflationRate > 1.5) {
    if (total > 700e6 || workingQty > allocation) return sections;
    const amount = total * (inflationRate / (12 * 100));

    sections.push({
      type: "linear",
      start,
      end: start + periodToSeconds.month,
      amount,
    });

    workingQty += amount;
    total += amount;
    start += periodToSeconds.month;
    inflationRate *= (1 - disinflationRate) ** (1 / 12);
  }

  return sections;
};

const solana: Protocol = {
  "Seed Round": manualCliff(unlock, purchaser * 0.427),
  "Founding Round": manualCliff(unlock, purchaser * 0.34),
  "Validator Round": manualCliff(unlock, purchaser * 0.136),
  "Strategic Round": manualCliff(unlock, purchaser * 0.054),
  "CoinList Auction": manualCliff(mainnet, purchaser * 0.043),
  "Grant pool": manualCliff(1596236400, qty * 0.04),
  Foundation: manualCliff(foundersUnlock, qty * 0.125),
  "Staking Rewards": inflation(),
  Founders: manualLinear(
    foundersUnlock,
    foundersUnlock + periodToSeconds.year * 2,
    qty * 0.125,
  ),
  meta: {
    sources: [
      "https://coinlist.co/solana",
      "https://docs.solana.com/inflation/inflation_schedule",
      "https://medium.com/solana-labs/solana-foundation-transparency-report-1-b267fe8595c0",
    ],
    token: "coingecko:solana",
    protocolIds: [],
  },
  categories: {
    insiders: [
      "Seed Round",
      "Founding Round",
      "Validator Round",
      "Strategic Round",
      "Founders",
    ],
    publicSale: ["CoinList Auction"],
    noncirculating: ["Grant pool", "Staking Rewards", "Foundation"],
  },
};
export default solana;
