import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const rewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`
SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE chain = '43114' AND short_topic0 = '0xc9695243'
WHERE topic0 = '0xc9695243a805adb74c91f28311176c65b417e842d5699893cef56d18bfa48cba'
AND address IN (
    SELECT concat('0x', substr(topic1,-40)) as gauge
    FROM evm_indexer.logs
    PREWHERE chain = '43114' AND short_address = '0x59aa1773' AND short_topic0 = '0xa4d97e9e'
    WHERE address = '0x59aa177312ff6bdf39c8af6f46dae217bf76cbf6'
    AND topic0 = '0xa4d97e9e7c65249b4cd01acb82add613adea98af32daf092366982f0a0d4e453'
)
GROUP BY date
ORDER BY date DESC;`, {})

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount)
    });
  }
  return result;
}

const blackhole: Protocol = {
  Rewards: rewards,
  meta: {
    sources: [
    ],
    token: "coingecko:blackhole",
    protocolIds: ["parent#blackhole"],
    notes: ["Rewards data are calculated from gauges claim events"]
  },
  categories: {
    farming: ["Rewards"],
  },
};

export default blackhole;
