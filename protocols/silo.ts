import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds, readableToSeconds } from "../utils/time";
import vesting from "../adapters/uniswap/uniswap";
import { queryCustom } from "../utils/queries";

const qty = 1000000000;
const start = 1638316800; // December 1, 2021

const REWARDS_CLAIMED_TOPIC = '0x5637d7f962248a7f05a7ab69eec6446e31f3d0a299d997f135a65c62806e7891';
const HEDGEY_CLAIM_TOPIC = '0x18ee3c31d4863a37e1b4563022fa292ed3f955a41fe1e49a2e8da1b986430e20';
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

const HEDGEY_CONFIG = {
  arbitrum: {
    chainId: '42161',
    hedgeyContract: '0xe9c01f928296359ba1d0ad1000cc9bf972cb0026',
    siloToken: '0x0341c0c0ec423328621788d4854119b97f44e391',
  },
};

const CHAIN_CONFIG = {
  ethereum: {
    chainId: '1',
    rewardAddresses: ['0x6c1603ab6cecf89dd60c24530dde23f97da3c229', '0x4999873bf8741bfffb0ec242aaaa7ef1fe74fce8'],
  },
  arbitrum: {
    chainId: '42161',
    rewardAddresses: ['0xbdbbf747402653a5ad6f6b8c49f2e8dcec37facf'],
  },
  base: {
    chainId: '8453',
    rewardAddresses: ['0x626e6a8d4eb33d77a8b631abfe2e98da69e3100e'],
  },
  optimism: {
    chainId: '10',
    rewardAddresses: ['0x847d9420643e117798e803d9c5f0e406277cb622'],
  },
};

const createChainRewards = (chainId: string, addresses: string[]) => {
  return async (): Promise<CliffAdapterResult[]> => {
    const addressList = addresses.map(a => `'${a}'`).join(', ');
    const data = await queryCustom(`
      SELECT
        toStartOfDay(timestamp) AS date,
        SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
      FROM evm_indexer.logs
      PREWHERE chain = '${chainId}'
      WHERE topic0 = '${REWARDS_CLAIMED_TOPIC}'
        AND address IN (${addressList})
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
};

const createHedgeyRewards = (chainId: string, hedgeyContract: string, siloToken: string) => {
  return async (): Promise<CliffAdapterResult[]> => {
    const data = await queryCustom(`
      SELECT
        toStartOfDay(l1.timestamp) AS date,
        SUM(reinterpretAsUInt256(reverse(unhex(substring(l1.data, 3))))) / 1e18 AS amount
      FROM evm_indexer.logs l1
      INNER JOIN evm_indexer.logs l2 ON l1.transaction_hash = l2.transaction_hash AND l2.chain = '${chainId}'
      PREWHERE l1.chain = '${chainId}'
      WHERE l1.topic0 = '${TRANSFER_TOPIC}'
        AND l1.address = '${siloToken}'
        AND l2.topic0 = '${HEDGEY_CLAIM_TOPIC}'
        AND l2.address = '${hedgeyContract}'
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
};

const vestingSection: SectionV2 = {
  displayName: "Vesting",
  methodology: "Token allocations with vesting schedules from TGE (December 2021)",
  components: [
    {
      id: "genesis-pol",
      name: "Genesis Protocol-Owned Liquidity",
      methodology: "10% unlocked at TGE for protocol-owned liquidity",
      fetch: async () => [manualCliff(start, qty * 0.1)],
    },
    {
      id: "community-treasury",
      name: "Community Treasury",
      methodology: "45% vested linearly over 3 years from TGE",
      fetch: async () => [manualLinear(start, start + periodToSeconds.year * 3, qty * 0.45)],
    },
    {
      id: "early-contributors",
      name: "Early Contributors",
      methodology: "6.75% with 6-month cliff (12.5% unlocks), then linear vesting over remaining 3.5 years",
      fetch: async () => [
        manualCliff(start + periodToSeconds.month * 6, (qty * 0.0675) / 8),
        manualLinear(start + periodToSeconds.month * 6, start + periodToSeconds.year * 4, (qty * 0.0675 * 7) / 8),
      ],
    },
    {
      id: "founding-contributors",
      name: "Founding Contributors",
      methodology: "21.75% with 6-month cliff (16.67% unlocks), then linear vesting over remaining 2.5 years",
      fetch: async () => [
        manualCliff(start + periodToSeconds.month * 6, (qty * 0.2175) / 6),
        manualLinear(start + periodToSeconds.month * 6, start + periodToSeconds.year * 3, (qty * 0.2175 * 5) / 6),
      ],
    },
    {
      id: "early-community-rewards",
      name: "Early Community Rewards",
      methodology: "0.2% distributed to early community members on January 1, 2022",
      fetch: async () => [manualCliff("2022-01-01", qty * 0.002)],
    },
    {
      id: "early-investors-advisors",
      name: "Early Investors & Advisors",
      methodology: "6.3% vested linearly from 6 months to 2.5 years after TGE",
      fetch: async () => [manualLinear(start + periodToSeconds.year * 0.5, start + periodToSeconds.year * 2.5, qty * 0.063)],
    },
    {
      id: "future-contributors-advisors",
      name: "Future Contributors & Advisors",
      methodology: "10% distributed to DAO via vesting contract for future contributors",
      fetch: async () => vesting("0x6e5C8274012d9cb386EF8Dcc71a461B71BD07831", "ethereum", "siloToken"),
    },
  ],
};

const incentivesSection: SectionV2 = {
  displayName: "Incentives",
  methodology: "Multi-chain reward distributions tracked via ClickHouse event logs",
  isIncentive: true,
  components: [
    {
      id: "ethereum-rewards",
      name: "Ethereum Rewards",
      methodology: "Tracks RewardsClaimed events from Silo incentive contracts on Ethereum",
      isIncentive: true,
      fetch: createChainRewards(CHAIN_CONFIG.ethereum.chainId, CHAIN_CONFIG.ethereum.rewardAddresses),
      metadata: {
        chain: "ethereum",
        chainId: "1",
        contracts: CHAIN_CONFIG.ethereum.rewardAddresses,
        eventSignature: REWARDS_CLAIMED_TOPIC,
      },
    },
    {
      id: "arbitrum-rewards",
      name: "Arbitrum Rewards",
      methodology: "Tracks RewardsClaimed events from SiloIncentivesController on Arbitrum",
      isIncentive: true,
      fetch: createChainRewards(CHAIN_CONFIG.arbitrum.chainId, CHAIN_CONFIG.arbitrum.rewardAddresses),
      metadata: {
        chain: "arbitrum",
        chainId: "42161",
        contract: CHAIN_CONFIG.arbitrum.rewardAddresses[0],
        eventSignature: REWARDS_CLAIMED_TOPIC,
      },
    },
    {
      id: "arbitrum-hedgey",
      name: "Arbitrum Hedgey Claims",
      methodology: "Tracks SILO token claims from Hedgey Finance vesting contracts on Arbitrum",
      isIncentive: true,
      fetch: createHedgeyRewards(
        HEDGEY_CONFIG.arbitrum.chainId,
        HEDGEY_CONFIG.arbitrum.hedgeyContract,
        HEDGEY_CONFIG.arbitrum.siloToken
      ),
      metadata: {
        chain: "arbitrum",
        chainId: "42161",
        hedgeyContract: HEDGEY_CONFIG.arbitrum.hedgeyContract,
        siloToken: HEDGEY_CONFIG.arbitrum.siloToken,
      },
    },
    {
      id: "base-rewards",
      name: "Base Rewards",
      methodology: "Tracks RewardsClaimed events from SiloIncentivesController on Base",
      isIncentive: true,
      fetch: createChainRewards(CHAIN_CONFIG.base.chainId, CHAIN_CONFIG.base.rewardAddresses),
      metadata: {
        chain: "base",
        chainId: "8453",
        contract: CHAIN_CONFIG.base.rewardAddresses[0],
        eventSignature: REWARDS_CLAIMED_TOPIC,
      },
    },
    {
      id: "optimism-rewards",
      name: "Optimism Rewards",
      methodology: "Tracks RewardsClaimed events from SiloIncentivesController on Optimism",
      isIncentive: true,
      fetch: createChainRewards(CHAIN_CONFIG.optimism.chainId, CHAIN_CONFIG.optimism.rewardAddresses),
      metadata: {
        chain: "optimism",
        chainId: "10",
        contract: CHAIN_CONFIG.optimism.rewardAddresses[0],
        eventSignature: REWARDS_CLAIMED_TOPIC,
      },
    },
  ],
};

const silo: ProtocolV2 = {
  "Vesting": vestingSection,
  "Incentives": incentivesSection,

  meta: {
    version: 2,
    sources: [
      "https://silopedia.silo.finance/governance/token-allocation-and-vesting",
      "https://devdocs.silo.finance/security/smart-contracts",
    ],
    notes: [
      "Future contributors and advisors (10%) are distributed to the DAO on a linear unlock, then individuals have further vesting depending on when they join",
      "Incentives tracked across Ethereum, Arbitrum, Base, and Optimism",
      "Hedgey Finance vesting claims tracked on Arbitrum",
    ],
    token: "ethereum:0x6f80310ca7f2c654691d1383149fa1a57d8ab1f8",
    protocolIds: ["2020"],
    total: qty,
  },

  categories: {
    publicSale: ["Vesting"],
    noncirculating: ["Vesting"],
    insiders: ["Vesting"],
    farming: ["Incentives"],
    airdrop: ["Vesting"],
  },
};

export default silo;
