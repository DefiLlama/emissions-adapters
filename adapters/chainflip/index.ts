import { CliffAdapterResult } from "../../types/adapters";
import { queryCustom, toShort } from "../../utils/queries";
import { readableToSeconds } from "../../utils/time";

const contributorsAddress = "0xce317d9909f5ddd30dcd7331f832e906adc81f5d";
const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export default async function queryContributorTransfers(start: number, token: string): Promise<CliffAdapterResult[]> {
  const sql = `
    SELECT toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '${toShort(token)}'
      AND short_topic0 = '${toShort(transferTopic)}'
    WHERE address = '${token}'
      AND topic0 = '${transferTopic}'
      AND topic1 = lower(concat('0x', lpad(substring('${contributorsAddress}', 3), 64, '0')))
    GROUP BY date ORDER BY date ASC`;

  const data = await queryCustom(sql, {});
  return data.filter(d => readableToSeconds(d.date) >= start).map((d) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
  }));
}