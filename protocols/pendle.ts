import { manualCliff, manualStep } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start: number = 1619478000;
const qty: number = 251_061_124;

const MARKET_CLAIM_REWARD = "0xf7823f78d472190ac0f94e11854ed334dce4a2e571e5f1bf7a8aec9469891d97";

const GAUGE_CONTROLLERS = [
  { id: "ethereum",  name: "Ethereum",  chain: "ethereum",  chainId: "1",     address: "0x47d74516b33ed5d70dde7119a40839f6fcc24e57" },
  { id: "arbitrum",  name: "Arbitrum",  chain: "arbitrum",  chainId: "42161", address: "0x1e56299ebc8a1010cec26005d12e3e5c5cc2db00" },
  { id: "optimism",  name: "Optimism",  chain: "optimism",  chainId: "10",    address: "0x6875e4a945e498fe1b90bbb13cfbaf0b68658c9c" },
  { id: "bsc",       name: "BNB Chain", chain: "bsc",       chainId: "56",    address: "0x704478dd72fd7f9b83d1f1e0fc18c14b54f034d0" },
  { id: "berachain", name: "Berachain", chain: "berachain", chainId: "80094", address: "0x704478dd72fd7f9b83d1f1e0fc18c14b54f034d0" },
  { id: "sonic",     name: "Sonic",     chain: "sonic",     chainId: "146",   address: "0xee708fc793a02f1edd5bb9dbd7fd13010d1f7136" },
  { id: "mantle",    name: "Mantle",    chain: "mantle",    chainId: "5000",  address: "0x428f2f93afac3f96b0de59854038c585e06165c8" },
  { id: "base",      name: "Base",      chain: "base",      chainId: "8453",  address: "0x17f100fb4be2707675c6439468d38249dd993d58" },
  { id: "hyperevm",  name: "HyperEVM",  chain: "hyperevm",  chainId: "999",   address: "0x7e500c6efbb00fd3227888256e477171a1304721" },
];

const buildMarketClaimQuery = (chainId: string, address: string): string => `
  SELECT toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
  FROM evm_indexer.logs
  PREWHERE chain = '${chainId}'
    AND short_address = '${address.slice(0, 10)}'
    AND short_topic0 = '${MARKET_CLAIM_REWARD.slice(0, 10)}'
  WHERE address = '${address}'
    AND topic0 = '${MARKET_CLAIM_REWARD}'
  GROUP BY date ORDER BY date DESC`;

const toResultArray = (data: any[]): CliffAdapterResult[] =>
  data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false,
  }));

const incentivesSection: SectionV2 = {
  displayName: "Incentives",
  methodology: "Tracks PENDLE market reward distributions via MarketClaimReward events from GaugeController contracts across Ethereum, Arbitrum, Optimism, BNB Chain, Berachain, Sonic, Mantle, Base, and HyperEVM",
  isIncentive: true,
  components: GAUGE_CONTROLLERS.map(({ id, name, chain, chainId, address }) => ({
    id: `${id}-market-rewards`,
    name: `${name} Market Rewards`,
    methodology: `Tracks MarketClaimReward events from PendleGaugeController on ${name}.`,
    isIncentive: true,
    fetch: async () => toResultArray(await queryCustom(buildMarketClaimQuery(chainId, address), {})),
    metadata: {
      contracts: [address],
      chain,
      chainId,
      eventSignature: MARKET_CLAIM_REWARD,
    },
  })),
};

const pendle: ProtocolV2 = {
  Incentives: incentivesSection,
  Investors: manualStep(start, periodToSeconds.month * 3, 4, (qty * 0.15) / 4),
  Advisors: manualStep(start, periodToSeconds.month * 3, 4, (qty * 0.01) / 4),
  "Liquidity bootstrapping": manualCliff(start, qty * 0.07),
  "Ecosystem fund": [
    manualCliff(start, qty * 0.09),
    manualCliff(start + periodToSeconds.year, qty * 0.09),
  ],
  Team: [
    manualCliff(start + periodToSeconds.year, qty * 0.11),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month * 3,
      4,
      (qty * 0.11) / 4
    ),
  ],
  meta: {
    version: 2,
    sources: ["https://medium.com/pendle/pendle-tokenomics-3a33d9caa0e4"],
    token: "ethereum:0x808507121b80c02388fad14726482e061b8da827",
    protocolIds: ["382"],
    notes: [
      "PENDLE incentives tracked via MarketClaimReward events from GaugeController contracts across Ethereum, Arbitrum, Optimism, BNB Chain, Berachain, Sonic, Mantle, Base, and HyperEVM",
    ],
  },
  categories: {
    farming: ["Incentives"],
    noncirculating: ["Ecosystem fund"],
    privateSale: ["Investors"],
    insiders: ["Team", "Advisors", "Liquidity bootstrapping"],
  },
};
export default pendle;
