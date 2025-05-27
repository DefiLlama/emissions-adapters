import { ClickHouseClient, createClient, Row } from '@clickhouse/client';
import { getEnv } from './env';

let client: ClickHouseClient | null = null;

const requiredVars = ['CLICKHOUSE_HOST', 'CLICKHOUSE_USERNAME', 'CLICKHOUSE_PASSWORD'];

export function connectClickhouse() {
  if (!client) {
    const missingVars = requiredVars.filter(varName => !getEnv(varName));
    if (missingVars.length) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    const url = `http://${getEnv('CLICKHOUSE_HOST')}:${getEnv('CLICKHOUSE_PORT')}`;
    client = createClient({
      url,
      username: getEnv('CLICKHOUSE_USERNAME'),
      password: getEnv('CLICKHOUSE_PASSWORD'),
      keep_alive: { enabled: true, idle_socket_ttl: 300000 },
      compression: { response: true, request: false }
    });
  }
  return client;
}

export async function queryClickhouse<T extends Row>(sql: string, params?: Record<string, any>): Promise<T[]> {
  try {
    const resultSet = await connectClickhouse().query({ 
      query: sql, 
      query_params: params,
      format: 'JSONEachRow'
    });
    return await resultSet.json<T>();
  } finally {
    await disconnectClickhouse();
  }
}

export async function disconnectClickhouse() {
  if (client) {
    await client.close();
    client = null;
  }
}