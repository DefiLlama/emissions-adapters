import { manualCliff } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1714089600; 
const total = 50_000;

const emissions = (percentage: number): LinearAdapterResult[] => {
  const result: LinearAdapterResult[] = [];
  let weeklyEmissionRate = 1_000;
  let weekNumber = 0;

  while (weeklyEmissionRate >= 1) {
    let currentWeekEmissionAmount = (weeklyEmissionRate * percentage) / 100;

    result.push({
      type: "linear",
      start: start + periodToSeconds.weeks(weekNumber),
      end: start + periodToSeconds.weeks(weekNumber + 1),
      amount: currentWeekEmissionAmount
    });

    weeklyEmissionRate *= 0.99; // apply 1% decay for the next period's calculation base
    weekNumber++;
  }

  return result;
}

const pharaoh: Protocol = {
  "Airdrop": manualCliff(start, total * 0.2), 
  "Reserves": manualCliff(start, total * 0.2),
  "ve Grants": manualCliff(start, total * 0.2),
  "Contributors": manualCliff(start, total * 0.2),
  "LGE": manualCliff(start, total * 0.1),
  "POL": manualCliff(start, total * 0.1),
  "Emissions": emissions(100),

  meta: {
    notes: [
    ],
    token: `avax:0xAAAB9D12A30504559b0C5a9A5977fEE4A6081c6b`,
    sources: [
      "https://docs.pharaoh.exchange/pages/tokenomics-and-emissions"
    ],
    protocolIds: ["4287", "3921"]
  },
  categories: {
    insiders: ["Contributors"],
    airdrop: ["Airdrop"],
    noncirculating: ["Reserves"],
    farming: ["LGE", "Emissions"],
    liquidity: ["POL"]
  }
};

export default pharaoh;
