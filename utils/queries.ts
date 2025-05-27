import { Row } from '@clickhouse/client';
import { queryClickhouse } from './clickhouse';

interface LogQueryParams {
  address: string;
  topic0: string;
  startDate: string;
  endDate: string;
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
      AND (timestamp < toDateTime({endDate:String}))
    GROUP BY date
    ORDER BY date ASC
  `;

  return queryClickhouse<DailyAmount>(sql, params);
} 