import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";


const qty = 2000000000;
const start = 1688169600; //1 July 2023 00:00:00
const startjan = 1704067200; // 1 January 2024 00:00:00
const chain = "ethereum";
const address = "0x7448c7456a97769f6cd04f1e83a4a23ccdc46abd";

const maverick: Protocol = {
  "Binance Launchpool": manualCliff(start, qty * 0.015),
  "Public Goods Fund": [
    manualCliff(start, 100000000), // 100m tokens release at start
    manualStep(
      startjan,
      periodToSeconds.month,
      79,
      (126029961) / 79,
    ), // monthly steps for the next 79 months
  ],
  "Investors": manualStep(
    start + periodToSeconds.year, periodToSeconds.month, 35,
    (360000000) / 35
  ),
  "Liquidity Mining and Airdrops": [
    manualCliff(start, 100000000), // 100m tokens release at start
    manualStep(
      startjan,
      periodToSeconds.month,
      79,
      (283293434) / 79,
    ), // monthly steps for the next 79 months 
  ],
  "Foundation & Treasury": [
    manualCliff(start, 20000000), // 20m tokens release at start
    manualStep(
      startjan,
      periodToSeconds.month,
      79,
      (98632148) / 79,
    ), // monthly steps for the next 79 months
  ],
  "Team": manualStep(
    start + periodToSeconds.year, periodToSeconds.month,
    60,
    (380000000) / 60
  ),

  "Advisors": [manualStep(
    start + periodToSeconds.year, periodToSeconds.month,
    35,
    (76200000) / 35
  ),manualStep(
    start +  4 * periodToSeconds.year, periodToSeconds.month,
    7,
    (6800000) / 7
  )],
  meta: {
    notes: ["The remaining allocation for Public Goods Fund, Liquidity Mining and Airdrops, and Foundation/ Treasury will vest beyond July 2030.",
            "After July 20 there's infinite tail emissions for the sections above"],
    sources: [
      "https://medium.com/maverick-protocol/maverick-ecosystem-incentive-program-95cf76dbfa5e",
      "https://research.binance.com/en/projects/maverick-protocol",
    ],
    token: `${chain}:${address}`,
    protocolIds: ["2644"],
  },
  categories: {
    publicSale: ["Binance Launchpool"],
    farming: ["Public Goods Fund","Liquidity Mining and Airdrops"],
    privateSale: ["Investors"],
    insiders: ["Foundation & Treasury","Team","Advisors"],
  },
};
export default maverick;