import { ClickHouseClient, createClient, Row } from "@clickhouse/client";
import { getEnv } from "./env";

let client: ClickHouseClient | null = null;
let connectionPromise: Promise<ClickHouseClient> | null = null;

const requiredVars = [
  "CLICKHOUSE_HOST",
  "CLICKHOUSE_USERNAME",
  "CLICKHOUSE_PASSWORD",
];

export async function connectClickhouse() {
  if (client) {
    return client;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const missingVars = requiredVars.filter((varName) => !getEnv(varName));
    if (missingVars.length) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`,
      );
    }

    const url = `http://${getEnv("CLICKHOUSE_HOST")}:${getEnv("CLICKHOUSE_PORT")}`;
    client = createClient({
      url,
      username: getEnv("CLICKHOUSE_USERNAME"),
      password: getEnv("CLICKHOUSE_PASSWORD"),
      keep_alive: { enabled: true, idle_socket_ttl: 300000 },
      compression: { response: true, request: false },
      max_open_connections: 10,
      request_timeout: 120000,
    });
    return client;
  })();

  return connectionPromise;
}

export async function queryClickhouse<T extends Row>(
  sql: string,
  params?: Record<string, any>,
): Promise<T[]> {
  const client = await connectClickhouse();
  try {
    const resultSet = await client.query({
      query: sql,
      query_params: params,
      format: "JSONEachRow",
    });
    return await resultSet.json<T>();
  } catch (error: any) {
    if (error?.code === "ECONNRESET" || error?.code === "ECONNREFUSED") {
      await disconnectClickhouse();
    }
    throw error;
  }
}

export async function disconnectClickhouse() {
  if (client) {
    await client.close();
    client = null;
    connectionPromise = null;
  }
}
