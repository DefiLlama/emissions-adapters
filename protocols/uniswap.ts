import { manualCliff, manualLinear } from "../adapters/manual";
import adapter from "../adapters/uniswap/uniswap";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = 1600106400;

// Event signatures
const REWARD_PAID_TOPIC = "0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486";
const NEW_CAMPAIGN_TOPIC = "0x6e3c6fa6d4815a856783888c5c3ea2ad7e7303ac0cca66c99f5bd93502c44299";

// V2 LP Staking contracts (Sept 18 - Nov 17, 2020, 5M UNI per pool)
const V2_STAKING_CONTRACTS = [
  "0x6c3e4cb2e96b01f4b866965a91ed4437839a121a", // ETH-USDT
  "0x7fba4b8dc5e7616e59622806932dbea72537a56b", // ETH-USDC
  "0xa1484c3aa22a66c62b77e0ae78e15258bd0cb711", // ETH-DAI
  "0xca35e32e7926b96a9988f61d510e038108d8068e", // ETH-WBTC
];

// Merkl DistributionCreator (same address on all chains)
const DISTRIBUTION_CREATOR = "0x8bb4c975ff3c250e0ceea271728547f3802b36fd";

// UNI token addresses per chain
const UNI_TOKENS = [
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", // Ethereum
  "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0", // Arbitrum
  "0xc3de830ea07524a0761646a6a4e4be0e114a3c83", // Base
];

const v2StakingRewards = async (): Promise<CliffAdapterResult[]> => {
  const shortAddresses = V2_STAKING_CONTRACTS.map(a => `'${a.slice(0, 10)}'`).join(", ");
  const fullAddresses = V2_STAKING_CONTRACTS.map(a => `'${a}'`).join(", ");

  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '1'
      AND short_address IN (${shortAddresses})
      AND short_topic0 = '${REWARD_PAID_TOPIC.slice(0, 10)}'
    WHERE address IN (${fullAddresses})
      AND topic0 = '${REWARD_PAID_TOPIC}'
    GROUP BY date
    ORDER BY date DESC
  `, {});

  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false,
  }));
};

const merklCampaigns = async (): Promise<CliffAdapterResult[]> => {
  const uniFilter = UNI_TOKENS.map(t => `'${t}'`).join(", ");

  // NewCampaign event data layout (ABI-encoded struct):
  // offset(32) + campaignId(32) + creator(32) + rewardToken(32) + amount(32) + campaignType(32) + startTimestamp(32) + duration(32) + ...
  // In hex substring positions (1-indexed after '0x'):
  // rewardToken address: chars 219-258, amount: chars 259-322, startTimestamp: chars 443 (last 8 of uint32), duration: chars 507 (last 8 of uint32)
  const campaigns: any[] = await queryCustom(`
    SELECT
      lower(concat('0x', substring(data, 219, 40))) AS reward_token,
      reinterpretAsUInt256(reverse(unhex(substring(data, 259, 64)))) / 1e18 AS amount,
      reinterpretAsUInt32(reverse(unhex(substring(data, 443, 8)))) AS start_timestamp,
      reinterpretAsUInt32(reverse(unhex(substring(data, 507, 8)))) AS duration_seconds
    FROM evm_indexer.logs
    PREWHERE short_address = '${DISTRIBUTION_CREATOR.slice(0, 10)}'
      AND short_topic0 = '${NEW_CAMPAIGN_TOPIC.slice(0, 10)}'
    WHERE address = '${DISTRIBUTION_CREATOR}'
      AND topic0 = '${NEW_CAMPAIGN_TOPIC}'
      AND lower(concat('0x', substring(data, 219, 40))) IN (${uniFilter})
    ORDER BY start_timestamp ASC
  `, {});

  // Amortize each campaign evenly across its duration days
  const dailyMap = new Map<number, number>();
  for (const c of campaigns) {
    const amount = Number(c.amount);
    const startTs = Number(c.start_timestamp);
    const durationSec = Number(c.duration_seconds);
    if (durationSec <= 0 || amount <= 0) continue;

    const durationDays = Math.ceil(durationSec / 86400);
    const dailyAmount = amount / durationDays;

    for (let day = 0; day < durationDays; day++) {
      const dayTs = Math.floor((startTs + day * 86400) / 86400) * 86400; // normalize to day start
      dailyMap.set(dayTs, (dailyMap.get(dayTs) || 0) + dailyAmount);
    }
  }

  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([ts, amount]) => ({
      type: "cliff" as const,
      start: ts,
      amount,
      isUnlock: false,
    }));
};

const community = async () =>
  Promise.all(
    [
      "0x4750c43867EF5F89869132ecCF19B9b6C4286E1a",
      "0xe3953D9d317B834592aB58AB2c7A6aD22b54075D",
      "0x4b4e140d1f131fdad6fb59c13af796fd194e4135",
      "0x3d30b1ab88d487b0f3061f40de76845bec3f1e94",
    ].map((a: string) => adapter(a, "ethereum", "uni")),
  );

const incentivesSection: SectionV2 = {
  displayName: "Incentives",
  methodology: "Tracks UNI token distributions to liquidity providers through V2 staking contracts (historical) and Merkl DistributionCreator campaigns (ongoing)",
  isIncentive: true,
  components: [
    {
      id: "v2-lp-staking-rewards",
      name: "V2 LP Staking Rewards",
      methodology: "Tracks RewardPaid events from 4 Uniswap V2 staking contracts (ETH-USDT, ETH-USDC, ETH-DAI, ETH-WBTC) on Ethereum. Initial 20M UNI liquidity mining program from Sept-Nov 2020.",
      isIncentive: true,
      fetch: v2StakingRewards,
      metadata: {
        contracts: V2_STAKING_CONTRACTS,
        chain: "ethereum",
        chainId: "1",
        eventSignature: REWARD_PAID_TOPIC,
      },
    },
    {
      id: "merkl-campaigns",
      name: "Merkl Campaigns",
      methodology: "Tracks NewCampaign events from Merkl DistributionCreator. Campaign amounts are amortized evenly across their duration. Filters for UNI reward token across Ethereum, Arbitrum, and Base.",
      isIncentive: true,
      fetch: merklCampaigns,
      metadata: {
        contract: DISTRIBUTION_CREATOR,
        chains: ["ethereum", "arbitrum", "base"],
        eventSignature: NEW_CAMPAIGN_TOPIC,
      },
    },
  ],
};

const uniswap: ProtocolV2 = {
  community,
  "Incentives": incentivesSection,
  airdrop: manualCliff(start, 150000000),
  team: manualLinear(start, start + periodToSeconds.year * 4, 212660000),
  investors: manualLinear(start, start + periodToSeconds.year * 4, 180440000),
  advisors: manualLinear(start, start + periodToSeconds.year * 4, 6900000),
  meta: {
    version: 2,
    sources: ["https://uniswap.org/blog/uni"],
    token: "ethereum:0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    protocolIds: ["2196", "2197", "2198"],
    notes: [
      "V2 LP staking rewards tracked via RewardPaid events from 4 historical staking contracts",
      "Merkl incentives tracked via NewCampaign events, amortized over campaign duration",
    ],
  },
  categories: {
    farming: ["community", "Incentives"],
    airdrop: ["airdrop"],
    privateSale: ["investors"],
    insiders: ["team", "advisors"],
  },
};
export default uniswap;
