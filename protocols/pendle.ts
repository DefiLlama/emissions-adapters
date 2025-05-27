import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol, AdapterResult, CliffAdapterResult } from "../types/adapters";
import { queryAggregatedDailyLogsAmounts, queryAggregatedDailyLogsAmountsMulti } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start: number = 1619478000;
const qty: number = 251_061_124;

const incentives = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];

  const data = await queryAggregatedDailyLogsAmountsMulti({
    addresses: ["0x47d74516b33ed5d70dde7119a40839f6fcc24e57", "0x1e56299ebc8a1010cec26005d12e3e5c5cc2db00", "0x6875e4a945e498fe1b90bbb13cfbaf0b68658c9c", "0x704478dd72fd7f9b83d1f1e0fc18c14b54f034d0", "0xee708fc793a02f1edd5bb9dbd7fd13010d1f7136"],
    topic0: "0xf7823f78d472190ac0f94e11854ed334dce4a2e571e5f1bf7a8aec9469891d97",
    startDate: "2022-11-23",
  })

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount) / 1e18
    });
  }
  return result;
}

const pendle: Protocol = {
  Incentives: incentives,
  Investors: manualStep(start, periodToSeconds.month * 3, 4, (qty * 0.15) / 4),
  Advisors: manualStep(start, periodToSeconds.month * 3, 4, (qty * 0.01) / 4),
  "Liquidity bootstrapping": manualCliff(start, qty * 0.07),
  "Ecosystem fund": [
    manualCliff(start, qty * 0.09),
    manualCliff(start + periodToSeconds.year, qty * 0.09),
  ],
  Team: [
    manualCliff(start + periodToSeconds.year, qty * 0.11),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month * 3,
      4,
      (qty * 0.11) / 4
    ),
  ],
  meta: {
    sources: ["https://medium.com/pendle/pendle-tokenomics-3a33d9caa0e4"],
    token: "ethereum:0x808507121b80c02388fad14726482e061b8da827",
    protocolIds: ["382"],
    notes: ["Incentives are calculated from MarketClaimReward event. The data is fetched from the Ethereum, Arbitrum, Optimism, Sonic and BSC chains."]
  },
  categories: {
    farming: ["Incentives"],
    noncirculating: ["Ecosystem fund"],
    privateSale: ["Investors"],
    insiders: ["Team", "Advisors", "Liquidity bootstrapping"],
  },
};
export default pendle;
