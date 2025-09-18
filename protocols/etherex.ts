import { manualCliff } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds, readableToSeconds } from "../utils/time";
import { queryAggregatedDailyLogsAmounts } from "../utils/queries";

const start = 1755129600;
const total = 1_000_000_000; // Maximum supply cap of 1B tokens

const emissions = async (): Promise<LinearAdapterResult[]> => {
  const result: LinearAdapterResult[] = [];

  const data = await queryAggregatedDailyLogsAmounts({
    address: "0x0b6d3b42861ee8abfcaac818033694e758ecc3eb",
    topic0: "0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885",
    startDate: "2025-08-14",
  })

  data.sort((a, b) => readableToSeconds(a.date) - readableToSeconds(b.date));

  for (let i = 0; i < data.length; i++) {
    const currentTimestamp = readableToSeconds(data[i].date);
    const nextTimestamp = i < data.length - 1 
      ? readableToSeconds(data[i + 1].date)
      : currentTimestamp + periodToSeconds.week;

    result.push({
      type: "linear",
      start: currentTimestamp,
      end: nextTimestamp,
      amount: Number(data[i].amount) / 1e18,
    });
  }
  
  return result;
}

const etherex: Protocol = {
  // Initial REX token allocations (percentages of initial 350M supply, calculated from 1B total)
  "Treasury": manualCliff(start, total * 0.0875), // 8.75% of 1B = 87.5M REX (25% of initial supply)
  "Linea/Consensys": manualCliff(start, total * 0.0875), // 8.75% of 1B = 87.5M REX (25% of initial supply)
  "veNILE Migrators": manualCliff(start, total * 0.0875), // 8.75% of 1B = 87.5M REX (25% of initial supply)
  "LP Treasury Support": manualCliff(start, total * 0.0525), // 5.25% of 1B = 52.5M REX (15% of initial supply)
  "CEX Listings & Market Makers": manualCliff(start, total * 0.0175), // 1.75% of 1B = 17.5M REX (5% of initial supply)
  "Ecosystem Partners": manualCliff(start, total * 0.0175), // 1.75% of 1B = 17.5M REX (5% of initial supply)

  "Gauge Emissions": emissions,

  meta: {
    notes: [
      "Initial supply: 350M REX tokens with maximum cap of 1B tokens",
      "Initial weekly emissions: 3.5M REX tokens",
      "Emissions can be modified by up to ±25% per epoch through governance",
      "100% of emissions are distributed to gauges",
      "No team allocation - fully community focused",
      "Emission schedule: +20% epoch 1, +10% epoch 2, +9% epoch 3, -16% epoch 4, -25% epoch 5, then -1% decay per epoch",
      "Projected total supply after 10 years: approximately 683M tokens",
    ],
    token: `coingecko:etherex`,
    sources: [
      "https://docs.etherex.finance/pages/tokenomics",
      "https://etherscan.io/address/0x0b6d3B42861eE8aBFCaaC818033694E758ECC3eb"
    ],
    protocolIds: ["parent#etherex"]
  },
  categories: {
    insiders: ["Linea/Consensys"],
    noncirculating: ["veNILE Migrators", "Ecosystem Partners", "Treasury"],
    farming: ["Gauge Emissions"],
    liquidity: ["CEX Listings & Market Makers", "LP Treasury Support"]
  }
};

export default etherex;
