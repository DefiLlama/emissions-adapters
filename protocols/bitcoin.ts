import { manualLinear } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";

const initialReward: number = 50;
const halveningDates: string[] = [
  "2009/01/03", // 0
  "2012/11/28", // 210k
  "2016/07/09", // 420k
  "2020/05/11", // 630k
  "2024/04/28/", // 840k estimated
  "2028/06/09", // 1050k estimated
];

function rewards(): LinearAdapterResult[] {
  const sections: LinearAdapterResult[] = [];
  let reward: number = initialReward;

  for (let i = 0; i < halveningDates.length - 1; i++) {
    const qty = reward * 210000;
    sections.push(manualLinear(halveningDates[i], halveningDates[i + 1], qty));
    reward /= 2;
  }

  return sections;
}

const bitcoin: Protocol = {
  "Mining rewards": rewards(),
  meta: {
    sources: [
      "https://cryptoanswers.com/faq/bitcoin-halving-dates-history/",
      "https://blockstream.info/",
      "https://www.coingecko.com/en/coins/bitcoin/bitcoin-halving",
    ],
    token: "coingecko:bitcoin",
    protocolIds: ["2786"],
    notes: [
      `Future halvenings have at a specified block height, therefore the dates shown are an estimate only.`,
    ],
  },
  categories: {
    farming: ["Mining rewards"],
  },
};

export default bitcoin;
