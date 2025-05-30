import { getLogs } from "@defillama/sdk/build/util/indexer";
import { getBlock } from "@defillama/sdk/build/computeTVL/blocks";
import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds, readableToSeconds, unixTimestampNow } from "../utils/time";
import { queryAggregatedDailyLogsAmounts } from "../utils/queries";

const start = 1736899200; 
const total = 10_000_000;

const emissions = async (): Promise<LinearAdapterResult[]> => {
  const result: LinearAdapterResult[] = [];

  const data = await queryAggregatedDailyLogsAmounts({
    address: "0xc7022f359cd1bda8ab8a19d1f19d769cbf7f3765",
    topic0: "0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885",
    startDate: "2025-01-15",
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

const shadow: Protocol = {
  // Direct SHADOW allocations (no vesting)
  "Protocol-Owned Liquidity": manualCliff(start, total * 0.03),  // 300,000
  "Reserves": manualCliff(start, total * 0.045),         // 450,000

  // xSHADOW allocations (with 180-day vesting)
  "Contributors": manualLinear(
    start,
    start + periodToSeconds.days(180),
    total * 0.075,
  ),
  "Presales": manualLinear(
    start,
    start + periodToSeconds.days(180),
    total * 0.075,
  ),
  "Airdrop": manualLinear(
    start,
    start + periodToSeconds.days(180),
    total * 0.03,
  ),
  "Partners": manualLinear(
    start,
    start + periodToSeconds.days(180),
    total * 0.03,
  ),
  "Community Incentives": manualLinear(
    start,
    start + periodToSeconds.days(180),
    total * 0.015,
  ),

  "Gauge Emissions": emissions,

  meta: {
    notes: [
      "We assume the initial allocations are linearly vested over 180 days.",
      "All allocations except Protocol-Owned Liquidity and Reserves are locked in xSHADOW.",
      "The emissions are taken directly using onchain data by filtering the logs for Mint events from Minter",
    ],
    token: `sonic:0x3333b97138d4b086720b5ae8a7844b1345a33333`,
    sources: [
      "https://docs.shadow.so/pages/tokenomics",
      "https://docs.shadow.so/pages/xshadow",
      "https://sonicscan.org/tx/0xdbd2344dfd88f549599bb17a01e86263592da6c034d4a8541d824832ba375d86",
      "https://sonicscan.org/address/0xc7022f359cd1bda8ab8a19d1f19d769cbf7f3765"
    ],
    protocolIds: ["parent#shadow-exchange"]
  },
  categories: {
    insiders: ["Contributors", "Partners"],
    publicSale: ["Presales"],
    airdrop: ["Airdrop"],
    noncirculating: ["Reserves"],
    farming: ["Gauge Emissions"],
    liquidity: ["Protocol-Owned Liquidity"]
  }
};

export default shadow;
