import { httpGet, httpPost } from "./fetchURL";
import { getEnv } from "./env";
import { CliffAdapterResult } from "../types/adapters";
import { elastic } from "@defillama/sdk";
const plimit = require("p-limit");
const limit = plimit(1);

const isRestrictedMode = getEnv("DUNE_RESTRICTED_MODE") === "true";
const API_KEYS = getEnv("DUNE_API_KEYS")?.split(",") ?? [
  "L0URsn5vwgyrWbBpQo9yS1E3C1DBJpZh",
];
let API_KEY_INDEX = 0;

const NOW_TIMESTAMP = Math.trunc(Date.now() / 1000);

const getLatestData = async (queryId: string, run_daily: boolean) => {
  checkCanRunDuneQuery();

  const url = `https://api.dune.com/api/v1/query/${queryId}/results`;
  try {
    const latest_result = await limit(() =>
      httpGet(url, {
        headers: {
          "x-dune-api-key": API_KEYS[API_KEY_INDEX],
        },
      }),
    );
    const submitted_at = latest_result.submitted_at;
    const submitted_at_timestamp = Math.trunc(
      new Date(submitted_at).getTime() / 1000,
    );
    const diff = NOW_TIMESTAMP - submitted_at_timestamp;
    if (!run_daily && diff < 60 * 60 * 3) {
      return latest_result.result.rows;
    } else if (run_daily && diff < 60 * 60 * 23) {
      return latest_result.result.rows;
    }
    return undefined;
  } catch (e: any) {
    throw e;
  }
};

async function randomDelay() {
  const delay = Math.floor(Math.random() * 5) + 2;
  return new Promise((resolve) => setTimeout(resolve, delay * 1000));
}

const inquiryStatus = async (execution_id: string, queryId: string) => {
  checkCanRunDuneQuery();

  let _status = undefined;
  do {
    try {
      _status = (
        await limit(() =>
          httpGet(
            `https://api.dune.com/api/v1/execution/${execution_id}/status`,
            {
              headers: {
                "x-dune-api-key": API_KEYS[API_KEY_INDEX],
              },
            },
          ),
        )
      ).state;
      if (["QUERY_STATE_PENDING", "QUERY_STATE_EXECUTING"].includes(_status)) {
        console.info(`waiting for query id ${queryId} to complete...`);
        await randomDelay(); // 1 - 4s
      }
    } catch (e: any) {
      throw e;
    }
  } while (
    _status !== "QUERY_STATE_COMPLETED" &&
    _status !== "QUERY_STATE_FAILED"
  );
  return _status;
};

const submitQuery = async (queryId: string, query_parameters = {}) => {
  checkCanRunDuneQuery();

  let query: undefined | any = undefined;
  try {
    query = await limit(() =>
      httpPost(
        `https://api.dune.com/api/v1/query/${queryId}/execute`,
        { query_parameters },
        {
          headers: {
            "x-dune-api-key": API_KEYS[API_KEY_INDEX],
            "Content-Type": "application/json",
          },
        },
      ),
    );
    if (query?.execution_id) {
      return query?.execution_id;
    } else {
      throw new Error("error query data: " + query);
    }
  } catch (e: any) {
    throw e;
  }
};

export const queryDune = async (
  queryId: string,
  run_daily: boolean = false,
  query_parameters: any = {},
) => {
  checkCanRunDuneQuery();

  const metadata: any = { application: "dune", query_parameters };
  let success = false;
  let startTime = +Date.now() / 1e3;

  try {
    if (Object.keys(query_parameters).length === 0) {
      const latest_result = await getLatestData(queryId, run_daily);
      if (latest_result !== undefined) return latest_result;
    }
    const execution_id = await submitQuery(queryId, query_parameters);
    const _status = await inquiryStatus(execution_id, queryId);
    if (_status === "QUERY_STATE_COMPLETED") {
      const API_KEY = API_KEYS[API_KEY_INDEX];
      const queryStatus = await limit(() =>
        httpGet(
          `https://api.dune.com/api/v1/execution/${execution_id}/results?limit=100000`,
          {
            headers: {
              "x-dune-api-key": API_KEY,
            },
          },
        ),
      );
      const rows = queryStatus.result.rows;
      success = true;
      let endTime = +Date.now() / 1e3;
      await elastic.addRuntimeLog({
        runtime: endTime - startTime,
        success,
        metadata: { ...metadata, rows: rows?.length },
      });
      return rows;
    } else if (_status === "QUERY_STATE_FAILED") {
      if (query_parameters.fullQuery) {
        console.log(`Dune query: ${query_parameters.fullQuery}`);
      } else {
        console.log("Dune parameters", query_parameters);
      }
      throw new Error(`Dune query failed: ${queryId}`);
    }
  } catch (e: any) {
    let endTime = +Date.now() / 1e3;
    await elastic.addRuntimeLog({ runtime: endTime - startTime, success, metadata });
    await elastic.addErrorLog({ error: e?.toString(), metadata });
    throw e;
  }
};

const tableName = {
  bsc: "bnb",
  ethereum: "ethereum",
  base: "base",
  avax: "avalanche_c",
} as any;

export function checkCanRunDuneQuery() {
  if (!isRestrictedMode) return;
  const currentHour = new Date().getUTCHours();
  if (currentHour >= 1 && currentHour <= 3) return; // 1am - 3am - any time other than this, throw error
  throw new Error(
    `Current hour is ${currentHour}. In restricted mode, can run dune queries only between 1am - 3am UTC`,
  );
}

interface cacheKeys {
  protocolSlug: string;
  allocation: string
}

async function getExistingData(cacheKeys: cacheKeys, isUnlock = false) {
  let res: any = []
  try {
    res = await fetch(`https://pro-api.llama.fi/${process.env.INTERNAL_API_KEY}/api/emission/${cacheKeys.protocolSlug}`).then((r) =>
      r.json(),
    );
  } catch {}
  let body = res.body ? JSON.parse(res.body) : [];
  res =
    body && body.documentedData?.data.length
      ? (body.documentedData?.data ?? body.data)
      : [];
  const allocation = res.find((s: any) => s.label === cacheKeys.allocation);
  if (!allocation?.data?.length) return [];
  return allocation.data.map((row: any, i: number): CliffAdapterResult => ({
    type: "cliff",
    start: row.timestamp,
    isUnlock: isUnlock,
    amount: i === 0 ? row.unlocked : row.unlocked - allocation.data[i - 1].unlocked,
  })).filter((row: any) => row.amount !== 0)
}

export async function queryDuneSQLCached(query: string, start: number, cacheKeys: cacheKeys, isUnlock = false) {
  let results: any[] = []
  let startTime = start
  const existingData = await getExistingData(cacheKeys, isUnlock)
  if (existingData.length) {
    startTime = NOW_TIMESTAMP - 86400
    results = existingData.filter((r: CliffAdapterResult) => r.start < startTime)
  }
  const rawData = await queryDuneSQL(query, startTime)
  const newData = (rawData ?? []).map((row: any): CliffAdapterResult => ({
    type: "cliff",
    start: row.date,
    isUnlock: isUnlock,
    amount: row.amount
  }))
  results.push(...newData)
  return results
}

export async function queryDuneSQL(query: string, start: number) {
    return queryDune("3996608", true, {
    fullQuery: query.split("START").join(`from_unixtime(${start})`)
  })
}