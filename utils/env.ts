const BOOL_KEYS = [
    ''
]

const DEFAULTS: any = {
    BITLAYER_RPC: "https://rpc.bitlayer.org,https://rpc.ankr.com/bitlayer,https://rpc.bitlayer-rpc.com,https://rpc-bitlayer.rockx.com",
}

export const ENV_KEYS = new Set([
    ...BOOL_KEYS,
    ...Object.keys(DEFAULTS),
    'PANCAKESWAP_OPBNB_SUBGRAPH',
    'INDEXA_DB',
    'FLIPSIDE_API_KEY',
    'DUNE_API_KEYS',
    'DUNE_RESTRICTED_MODE',
    'ALLIUM_API_KEY',
    'BIT_QUERY_API_KEY',
    'SMARDEX_SUBGRAPH_API_KEY',
    'PROD_VYBE_API_KEY',
    'PERENNIAL_V2_SUBGRAPH_API_KEY',
    'LEVANA_API_KEY',
    'ZEROx_API_KEY',
    'ZEROX_API_KEY',
    'AGGREGATOR_0X_API_KEY',
    'SUI_RPC',
    'OKX_API_KEY',
    'ALCHEMIX_KEY',
    'ALCHEMIX_SECRET',
    'FLIPSIDE_RESTRICTED_MODE',
    'STARBASE_API_KEY',
    'ENSO_API_KEY',
])

// This is done to support both ZEROx_API_KEY and ZEROX_API_KEY
if (!process.env.ZEROX_API_KEY) process.env.ZEROX_API_KEY = process.env.ZEROx_API_KEY

Object.keys(DEFAULTS).forEach(i => {
    if (!process.env[i]) process.env[i] = DEFAULTS[i] // this is done to set the chain RPC details in @defillama/sdk
})


export function getEnv(key: string): any {
    if (!ENV_KEYS.has(key)) throw new Error(`Unknown env key: ${key}`)
    const value = process.env[key] ?? DEFAULTS[key]
    return BOOL_KEYS.includes(key) ? !!value : value
}
