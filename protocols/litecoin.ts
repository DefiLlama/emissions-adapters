import { manualLinear } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";

const initialReward: number = 50;
const halveningDates: string[] = [
  "2011/10/07", // Genesis Block
  "2015/08/25", // 840k
  "2019/08/05", // 1,680k
  "2023/08/02", // 2,520k
  "2027/07/27", // 3,360k projected
];

function rewards(): LinearAdapterResult[] {
  const sections: LinearAdapterResult[] = [];
  let reward: number = initialReward;

  for (let i = 0; i < halveningDates.length - 1; i++) {
    const qty = reward * 840000; // LTC uses 840k blocks per halving period
    sections.push(manualLinear(halveningDates[i], halveningDates[i + 1], qty));
    reward /= 2;
  }

  return sections;
}

const litecoin: Protocol = {
  "Mining rewards": rewards(),
  meta: {
    sources: [
      "https://litecoin.org",
      "https://www.litecoinhalving.com/",
    ],
    token: "coingecko:litecoin",
    protocolIds: [],
    notes: [
        `Future halvenings have at a specified block height, therefore the dates shown are an estimate only.`,
    ],
  },
  categories: {
    farming: ["Mining rewards"],
  },
};

export default litecoin;
