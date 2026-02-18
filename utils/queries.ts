import { Row } from "@clickhouse/client";
import { queryClickhouse } from "./clickhouse";

export const toShort = (str: string): string => str.slice(0, 10).toLowerCase();

interface LogQueryParams {
  address: string;
  topic0: string;
  startDate: string;
  endDate?: string;
}

interface DailyAmount extends Row {
  date: string;
  amount: string;
}

export async function queryAggregatedDailyLogsAmounts(
  params: LogQueryParams,
): Promise<DailyAmount[]> {
  const shortAddress = toShort(params.address);
  const shortTopic0 = toShort(params.topic0);
  const sql = `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '${shortAddress}' AND short_topic0 = '${shortTopic0}'
    WHERE (address = {address:String})
      AND (topic0 = {topic0:String})
      AND (timestamp >= toDateTime({startDate:String}))
      ${params.endDate ? "AND (timestamp < toDateTime({endDate:String}))" : ""}
    GROUP BY date
    ORDER BY date ASC
  `;

  return queryClickhouse<DailyAmount>(sql, params);
}

export async function queryAggregatedDailyLogsAmountsMulti(params: {
  addresses: string[];
  topic0: string;
  startDate: string;
  endDate?: string;
}): Promise<DailyAmount[]> {
  const shortAddresses = params.addresses.map(a => `'${toShort(a)}'`).join(', ');
  const shortTopic0 = toShort(params.topic0);
  const sql = `
    SELECT
      address,
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) AS amount
    FROM evm_indexer.logs
    PREWHERE short_address IN (${shortAddresses}) AND short_topic0 = '${shortTopic0}'
    WHERE (address IN ({addresses:Array(String)}))
      AND (topic0 = {topic0:String})
      AND (timestamp >= toDateTime({startDate:String}))
      ${params.endDate ? "AND (timestamp < toDateTime({endDate:String}))" : ""}
    GROUP BY address, date
    ORDER BY address, date
  `;

  return queryClickhouse<DailyAmount>(sql, params);
}

/*
  Query where event data is nonindexed address, uint256 amount
*/
export async function queryAddrAmount(params: {
  addresses: string[];
  topic0: string;
  startDate: string;
  endDate?: string;
}): Promise<DailyAmount[]> {
  const shortAddresses = params.addresses.map(a => `'${toShort(a)}'`).join(', ');
  const shortTopic0 = toShort(params.topic0);
  const sql = `
  SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 67, 64))))) AS amount
FROM evm_indexer.logs
  PREWHERE short_address IN (${shortAddresses}) AND short_topic0 = '${shortTopic0}'
  WHERE (address IN ({addresses:Array(String)}))
  AND topic0 = {topic0:String}
  AND (timestamp >= toDateTime({startDate:String}))
  ${params.endDate ? "AND (timestamp < toDateTime({endDate:String}))" : ""}
GROUP BY date
ORDER BY date ASC
    `;
  return queryClickhouse<DailyAmount>(sql, params);
}

export async function queryTransferEvents(params: {
  contractAddress: string;
  fromAddress?: string;
  toAddress?: string;
  startDate: string;
  endDate?: string;
}): Promise<DailyAmount[]> {
  const shortAddress = params.contractAddress ? toShort(params.contractAddress) : '';
  const shortTopic0 = '0xddf252ad';
  const sql = `
    SELECT
    toStartOfDay(timestamp) AS date,
    lower(concat('0x', right(topic1, 40))) AS from_address,
    lower(concat('0x', right(topic2, 40))) AS to_address,
    reinterpretAsUInt256(reverse(unhex(substring(data, 1, 64)))) AS amount
FROM evm_indexer.logs
PREWHERE ${params.contractAddress ? `short_address = '${shortAddress}' AND ` : ''}short_topic0 = '${shortTopic0}'
WHERE topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  AND timestamp >= toDateTime({startDate:String})
  ${params.endDate ? "AND timestamp < toDateTime({endDate:String})" : ""}
  ${params.contractAddress ? "AND address = {contractAddress:String}" : ""}
  ${params.fromAddress ? "AND topic1 = lower(concat('0x', lpad(substring({fromAddress:String}, 3), 64, '0')))" : ""}
  ${params.toAddress ? "AND topic2 = lower(concat('0x', lpad(substring({toAddress:String}, 3), 64, '0')))" : ""}
ORDER BY timestamp
`;

  return queryClickhouse<DailyAmount>(sql, params);
}

// custom queries as long as the output is table with date and amount
export async function queryCustom(
  sql: string,
  params: any,
): Promise<DailyAmount[]> {
  return queryClickhouse<DailyAmount>(sql, params);
}
