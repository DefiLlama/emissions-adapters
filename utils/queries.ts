import { Row } from "@clickhouse/client";
import { queryClickhouse } from "./clickhouse";

export const toShort = (str: string): string => str.slice(0, 10).toLowerCase();

interface LogQueryParams {
  address: string;
  topic0: string;
  startDate: string;
  endDate?: string;
  chain?: number;
}

interface DailyAmount extends Row {
  date: string;
  amount: string;
}

interface Transfers extends Row {
  date: string;
  from_address: string;
  to_address: string;
  amount: number;
}

interface Campaigns extends Row {
  start_timestamp: number;
  amount: number;
  duration: number;
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
    PREWHERE short_address = '${shortAddress}' AND short_topic0 = '${shortTopic0}'${params.chain != null ? ` AND chain = ${params.chain}` : ""}
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
}): Promise<Transfers[]> {
  const shortAddress = params.contractAddress ? toShort(params.contractAddress) : '';
  const shortTopic0 = '0xddf252ad';
  const sql = `
    SELECT
    toStartOfDay(timestamp) AS date,
    lower(concat('0x', right(topic1, 40))) AS from_address,
    lower(concat('0x', right(topic2, 40))) AS to_address,
    reinterpretAsUInt256(reverse(unhex(substring(data, 3, 64)))) AS amount
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

  return queryClickhouse<Transfers>(sql, params);
}

export async function queryDailyOutflows(params: {
  token: string;
  tokenDecimals?: number;
  fromAddress: string;
  startDate: string;
  endDate?: string;
}): Promise<DailyAmount[]> {
  const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  const decimals = params.tokenDecimals ?? 18
  const sql = `
    SELECT toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e${decimals} AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '${toShort(params.token)}'
      AND short_topic0 = '${toShort(transferTopic)}'
    WHERE address = {token:String}
      AND topic0 = '${transferTopic}'
      AND topic1 = lower(concat('0x', lpad(substring({fromAddress:String}, 3), 64, '0')))
      AND timestamp >= toDateTime({startDate:String})
      ${params.endDate ? "AND timestamp < toDateTime({endDate:String})" : ""}
    GROUP BY date ORDER BY date ASC`;
  return queryClickhouse<DailyAmount>(sql, params);
}

export async function queryDailyNetOutflows(params: {
  token: string;
  tokenDecimals?: number;
  address: string;
  startDate: string;
  endDate?: string;
}): Promise<DailyAmount[]> {
  const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  const decimals = params.tokenDecimals ?? 18;
  const paddedAddress = `lower(concat('0x', lpad(substring({address:String}, 3), 64, '0')))`;
  const sql = `
    SELECT date, SUM(amount) AS amount FROM (
      SELECT toStartOfDay(timestamp) AS date,
        reinterpretAsUInt256(reverse(unhex(substring(data, 3)))) / 1e${decimals} AS amount
      FROM evm_indexer.logs
      PREWHERE short_address = '${toShort(params.token)}'
        AND short_topic0 = '${toShort(transferTopic)}'
      WHERE address = {token:String}
        AND topic0 = '${transferTopic}'
        AND topic1 = ${paddedAddress}
        AND timestamp >= toDateTime({startDate:String})
        ${params.endDate ? "AND timestamp < toDateTime({endDate:String})" : ""}
      UNION ALL
      SELECT toStartOfDay(timestamp) AS date,
        -reinterpretAsUInt256(reverse(unhex(substring(data, 3)))) / 1e${decimals} AS amount
      FROM evm_indexer.logs
      PREWHERE short_address = '${toShort(params.token)}'
        AND short_topic0 = '${toShort(transferTopic)}'
      WHERE address = {token:String}
        AND topic0 = '${transferTopic}'
        AND topic2 = ${paddedAddress}
        AND timestamp >= toDateTime({startDate:String})
        ${params.endDate ? "AND timestamp < toDateTime({endDate:String})" : ""}
    )
    GROUP BY date ORDER BY date ASC`;
  return queryClickhouse<DailyAmount>(sql, params);
}

export async function queryMerklCampaigns(tokens: string[], DISTRIBUTION_CREATOR: string): Promise<Campaigns[]> {
  const NEW_CAMPAIGN_TOPIC = '0x6e3c6fa6d4815a856783888c5c3ea2ad7e7303ac0cca66c99f5bd93502c44299'
  const mappedTokens = tokens.map(t => `'${t}'`).join(", ");
  // NewCampaign event data layout (ABI-encoded struct):
  // offset(32) + campaignId(32) + creator(32) + rewardToken(32) + amount(32) + campaignType(32) + startTimestamp(32) + duration(32) + ...
  // In hex substring positions (1-indexed after '0x'):
  // rewardToken address: chars 219-258, amount: chars 259-322, startTimestamp: chars 443 (last 8 of uint32), duration: chars 507 (last 8 of uint32)
  const sql =`
    SELECT
      lower(concat('0x', substring(data, 219, 40))) AS reward_token,
      reinterpretAsUInt256(reverse(unhex(substring(data, 259, 64)))) / 1e18 AS amount,
      reinterpretAsUInt32(reverse(unhex(substring(data, 443, 8)))) AS start_timestamp,
      reinterpretAsUInt32(reverse(unhex(substring(data, 507, 8)))) AS duration
    FROM evm_indexer.logs
    PREWHERE short_address = '${DISTRIBUTION_CREATOR.slice(0, 10)}'
      AND short_topic0 = '${NEW_CAMPAIGN_TOPIC.slice(0, 10)}'
    WHERE address = '${DISTRIBUTION_CREATOR}'
      AND topic0 = '${NEW_CAMPAIGN_TOPIC}'
      AND lower(concat('0x', substring(data, 219, 40))) IN (${mappedTokens})
    ORDER BY start_timestamp ASC
  `;
  return queryClickhouse(sql, {})
};


// custom queries as long as the output is table with date and amount
export async function queryCustom(
  sql: string,
  params: any,
): Promise<DailyAmount[]> {
  return queryClickhouse<DailyAmount>(sql, params);
}
