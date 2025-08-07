const BOOL_KEYS = [""];

const DEFAULTS: any = {
  BITLAYER_RPC:
    "https://rpc.bitlayer.org,https://rpc.ankr.com/bitlayer,https://rpc.bitlayer-rpc.com,https://rpc-bitlayer.rockx.com",
};

export const ENV_KEYS = new Set([
  ...BOOL_KEYS,
  ...Object.keys(DEFAULTS),
  "DUNE_API_KEYS",
  "DUNE_RESTRICTED_MODE",
  "CLICKHOUSE_HOST",
  "CLICKHOUSE_USERNAME",
  "CLICKHOUSE_PASSWORD",
  "CLICKHOUSE_PORT",
]);

Object.keys(DEFAULTS).forEach((i) => {
  if (!process.env[i]) process.env[i] = DEFAULTS[i]; // this is done to set the chain RPC details in @defillama/sdk
});

export function getEnv(key: string): any {
  if (!ENV_KEYS.has(key)) throw new Error(`Unknown env key: ${key}`);
  const value = process.env[key] ?? DEFAULTS[key];
  return BOOL_KEYS.includes(key) ? !!value : value;
}
