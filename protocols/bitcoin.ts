import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, LinearAdapterResult, Protocol } from "../types/adapters";
import { queryDune } from "../utils/dune";
import { periodToSeconds, normalizeTime } from "../utils/time";

const initialReward: number = 50;
const halveningDates: string[] = [
  "2009/01/03", // 0
  "2012/11/28", // 210k
  "2016/07/09", // 420k
  "2020/05/11", // 630k
  "2024/04/28", // 840k estimated
  "2028/06/09", // 1050k estimated
];

const DUNE_QUERY_ID = "5166006";

const miningRewardsDune = async (): Promise<{ data: CliffAdapterResult[]; lastTimestamp: number }> => {
  const duneData = await queryDune(DUNE_QUERY_ID);
  const filtered = duneData.map((row: any) => ({
    type: "cliff",
    start: Number(row.timestamp),
    amount: Number(row.btc_mined),
    isUnlock: false,
  }));
  const lastTimestamp = Math.max(...duneData.map((row: any) => Number(row.timestamp)));
  return { data: filtered, lastTimestamp };
};

function miningRewardsForecast(splitTimestamp: number): LinearAdapterResult[] {
  const sections: LinearAdapterResult[] = [];
  let reward: number = initialReward;
  for (let i = 0; i < halveningDates.length - 1; i++) {
    const start = normalizeTime(halveningDates[i], undefined);
    const end = normalizeTime(halveningDates[i + 1], undefined);
    if (splitTimestamp >= end) {
      reward /= 2;
      continue;
    }
    let forecastStart = Math.max(splitTimestamp + periodToSeconds.day, start);
    if (forecastStart < end) {
      const qty = reward * 210000 * ((end - forecastStart) / (end - start));
      sections.push(manualLinear(forecastStart, end, qty));
    }
    reward /= 2;
    for (let j = i + 1; j < halveningDates.length - 1; j++) {
      const nextStart = normalizeTime(halveningDates[j], undefined);
      const nextEnd = normalizeTime(halveningDates[j + 1], undefined);
      const nextQty = reward * 210000;
      sections.push(manualLinear(nextStart, nextEnd, nextQty));
      reward /= 2;
    }
    break;
  }
  return sections;
}

const miningRewards = async (): Promise<(CliffAdapterResult | LinearAdapterResult)[]> => {
  const { data, lastTimestamp } = await miningRewardsDune();
  return [
    ...data,
    ...miningRewardsForecast(lastTimestamp),
  ];
};

const bitcoin: Protocol = {
  "Mining rewards": miningRewards,
  meta: {
    sources: [
      "https://cryptoanswers.com/faq/bitcoin-halving-dates-history/",
      "https://blockstream.info/",
      "https://www.coingecko.com/en/coins/bitcoin/bitcoin-halving",
      "https://dune.com/queries/5166006",
    ],
    token: "coingecko:bitcoin",
    protocolIds: ["2786"],
    chain: "bitcoin",
    notes: [
      `Past mining rewards are fetched from Dune Analytics (query 5166006). Future halvenings are forecasted and dates are estimates only.`,
    ],
  },
  categories: {
    farming: ["Mining rewards"],
  },
};

export default bitcoin;
