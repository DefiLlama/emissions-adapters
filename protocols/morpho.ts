import { manualCliff, manualLinear } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds, unixTimestampNow } from "../utils/time";
import adapter from "../adapters/morpho";

const total = 1e9; //1b

const arrayToData = (amounts: number[]): LinearAdapterResult[] => {
  let start: number = 1693526400;
  const period: number = periodToSeconds.months(3);
  const sections: LinearAdapterResult[] = [];

  amounts.map((a: number, i: number) => {
    const aPrevious = i == 0 ? 0 : amounts[i - 1];
    sections.push(manualLinear(start, start + period, a - aPrevious));
    start += period;
  });

  return sections;
};

const morpho: Protocol = {
  Contributors: [
    arrayToData([
      100000, 103650, 435766, 771533, 1107299, 1400276, 1755378, 2174118,
      2359299, 2561602, 2933177, 3302306, 3669536, 3841177, 4036767, 4378000,
      4378000, 4378000, 4378000, 4378000, 4378000, 4378000,
    ]),
    arrayToData([
      71515, 1855359, 1855359, 3014213, 4141285, 5477533, 6893384, 8403691,
      9945174, 9945174, 11639754, 13578007, 14951661, 16159363, 16159363,
      17317729, 18446395, 19403552, 20279469, 21145761, 22031305, 22853647,
    ]),
  ],
  Founders: manualLinear("2025-11-21", "2027-11-21", total * 0.152),
  "Early Contributors": manualLinear("2022-12-24", "2025-06-24", 23816944),
  "Strategic Partners": [
    manualLinear("2022-12-24", "2025-06-24", 23816944),
    manualLinear("2025-04-03", "2025-10-03", 169832182),
    manualLinear("2025-11-21", "2027-11-21", 81350874),
  ],
  //manualCliff("2025-01-01", 8649002.729523106), //
  Rewards: () => adapter(),
  meta: {
    notes: [
      `Some Strategic Partners and Founders unlocks may happen earlier depending on transferability date.`,
    ],
    token: "coingecko:morpho",
    sources: [
      "https://docs.morpho.org/learn/governance/morpho-token/#token-distribution--vesting",
      "https://docs.google.com/spreadsheets/d/1eVFzOvsMlPYHjPyJZlNKEqD9BI-WUaxqvKMPH6wLTjk/edit",
    ],
    protocolIds: ["parent#morpho","3014", "4025"],
    total,
    // incompleteSections: [
    //   {
    //     key: "Rewards",
    //     allocation: 521951409, // total - others
    //     lastRecord: () => unixTimestampNow(),
    //   },
    // ],
  },
  categories: {
    insiders: [
      "Contributors",
      "Founders",
      "Early Contributors",
      "Strategic Partners",
    ],
    farming: ["Rewards"],
  },
};
export default morpho;
