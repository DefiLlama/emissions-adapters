import { Row } from '@clickhouse/client';
import { queryClickhouse } from './clickhouse';

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

export async function queryAggregatedDailyLogsAmounts(params: LogQueryParams): Promise<DailyAmount[]> {
  const sql = `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) AS amount
    FROM evm_indexer.logs
    WHERE (address = {address:String}) 
      AND (topic0 = {topic0:String}) 
      AND (timestamp >= toDateTime({startDate:String}))
      ${params.endDate ? 'AND (timestamp < toDateTime({endDate:String}))' : ''}
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
  const sql = `
    SELECT
      address,
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) AS amount
    FROM evm_indexer.logs
    WHERE (address IN ({addresses:Array(String)})) 
      AND (topic0 = {topic0:String}) 
      AND (timestamp >= toDateTime({startDate:String}))
      ${params.endDate ? 'AND (timestamp < toDateTime({endDate:String}))' : ''}
    GROUP BY address, date
    ORDER BY address, date
  `;

  return queryClickhouse<DailyAmount>(sql, params);
}
