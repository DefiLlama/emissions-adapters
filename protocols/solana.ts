import { LinearAdapterResult, Protocol, CliffAdapterResult } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds, normalizeTime } from "../utils/time";
import { queryDune } from "../utils/dune";

const qty = 500e6;
const mainnet = 1585008000;
const unlock = mainnet + periodToSeconds.month * 9;
const purchaser = qty * 0.372;
const foundersUnlock = 1609977600;

const DUNE_QUERY_ID = "5166082";

// Fetch past staking rewards from Dune and return both data and the last timestamp
const stakingRewardsDune = async (): Promise<{ data: CliffAdapterResult[]; lastTimestamp: number }> => {
  const duneData = await queryDune(DUNE_QUERY_ID, true);
  // Dune returns { timestamp: epoch seconds, sol_reward: number }
  const filtered = duneData.map((row: any) => ({
    type: "cliff",
    start: Number(row.timestamp),
    amount: Number(row.sol_reward),
    isUnlock: false,
  }));
  const lastTimestamp = Math.max(...duneData.map((row: any) => Number(row.timestamp)));
  return { data: filtered, lastTimestamp };
};

// Forecast future staking rewards, starting after last Dune timestamp
function stakingRewardsForecast(splitTimestamp: number): LinearAdapterResult[] {
  const sections: LinearAdapterResult[] = [];
  const allocation = qty * 0.339;
  const disinflationRate = 0.15;
  let inflationRate = 8;
  let start = mainnet;
  let total = qty;
  let workingQty = 0;

  // Move start to after splitTimestamp
  while (start <= splitTimestamp) {
    if (total > 700e6 || workingQty > allocation) return [];
    const amount = total * (inflationRate / (12 * 100));
    workingQty += amount;
    total += amount;
    start += periodToSeconds.month;
    inflationRate *= (1 - disinflationRate) ** (1 / 12);
  }

  // Forecast from the day after splitTimestamp
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
}

const stakingRewards = async (): Promise<(CliffAdapterResult | LinearAdapterResult)[]> => {
  const { data, lastTimestamp } = await stakingRewardsDune();
  return [
    ...data,
    ...stakingRewardsForecast(lastTimestamp),
  ];
};

const solana: Protocol = {
  "Seed Round": manualCliff(unlock, purchaser * 0.427),
  "Founding Round": manualCliff(unlock, purchaser * 0.34),
  "Validator Round": manualCliff(unlock, purchaser * 0.136),
  "Strategic Round": manualCliff(unlock, purchaser * 0.054),
  "CoinList Auction": manualCliff(mainnet, purchaser * 0.043),
  "Grant pool": manualCliff(1596236400, qty * 0.04),
  Foundation: manualCliff(foundersUnlock, qty * 0.125),
  "Staking Rewards": stakingRewards,
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
      "https://dune.com/queries/5166082",
    ],
    token: "coingecko:solana",
    protocolIds: ["4611"],
    chain: "solana"
  },
  categories: {
    publicSale: ["CoinList Auction"],
    staking: ["Staking Rewards"],
    noncirculating: ["Grant pool","Foundation"],
    privateSale: ["Seed Round","Strategic Round"],
    insiders: ["Founding Round","Validator Round","Founders"],
  },
};
export default solana;
