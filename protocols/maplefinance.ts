import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = 1618876800; // April 20, 2021
const totalSupply = 10_000_000;

const MPL_TOKEN = "0x33349b282065b0284d756f0577fb39c158f935e6";
const REWARD_PAID_TOPIC = "0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// MplRewards v1 contracts (source: maple-labs/protocol-registry)
const MPL_REWARDS_CONTRACTS = [
  "0x7c57bf654bc16b0c9080f4f75ff62876f50b8259", // Maven11 USDC LP
  "0xe5a1cb65e7a608e778b3ccb02f7b2dfefee783b4", // Maven11 USDC Staking
  "0x0a76c7913c94f2af16958fbdf9b4cf0bbdb159d8", // Maven11 WETH LP
  "0x7869d7a3b074b5fa484dc04798e254c9c06a5e90", // Orthogonal USDC LP
  "0xf9d4d5a018d91e9bccc1e35ea78fcfecf4c5cbca", // Orthogonal USDC Staking
];

// Predefined reward account addresses (sources of MPL incentive distributions)
const REWARD_ACCOUNTS = [
  "0xd6d4bcde6c816f17889f1dd3000af0261b03a196", // Governor
  "0x4c3b453652cc3dd5d004d594e216f44d7541ea61", // Reward Wallet (operational distributor)
];

// Exclusion list: inter-wallet transfers + MplRewards (captured by RewardPaid)
const EXCLUSION_LIST = [...REWARD_ACCOUNTS, ...MPL_REWARDS_CONTRACTS];

const toResultArray = (data: any[]): CliffAdapterResult[] =>
  data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false,
  }));

const v1StakingRewards = async (): Promise<CliffAdapterResult[]> => {
  const shortAddresses = MPL_REWARDS_CONTRACTS.map(a => `'${a.slice(0, 10)}'`).join(", ");
  const fullAddresses = MPL_REWARDS_CONTRACTS.map(a => `'${a}'`).join(", ");

  return toResultArray(await queryCustom(`
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
  `, {}));
};

const directDistributions = async (): Promise<CliffAdapterResult[]> => {
  const sourceWallets = REWARD_ACCOUNTS.map(a => `'${a}'`).join(", ");

  return toResultArray(await queryCustom(`
    WITH
    source_wallets AS (
      SELECT arrayJoin([${sourceWallets}]) AS address
    ),
    exclusion_list AS (
      SELECT arrayJoin([${EXCLUSION_LIST.map(a => `'${a}'`).join(", ")}]) AS address
    )
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '1'
      AND short_address = '${MPL_TOKEN.slice(0, 10)}'
      AND short_topic0 = '${TRANSFER_TOPIC.slice(0, 10)}'
    WHERE address = '${MPL_TOKEN}'
      AND topic0 = '${TRANSFER_TOPIC}'
      AND lower(concat('0x', substring(topic1, 27))) IN (SELECT address FROM source_wallets)
      AND lower(concat('0x', substring(topic2, 27))) NOT IN (SELECT address FROM exclusion_list)
      AND topic2 != '0x0000000000000000000000000000000000000000000000000000000000000000'
    GROUP BY date
    ORDER BY date DESC
  `, {}));
};

const teamAdvisor = totalSupply * 0.25;
const seed = totalSupply * 0.26;
const publicSale = totalSupply * 0.05;
const treasury = totalSupply * 0.14;

const incentivesSection: SectionV2 = {
  displayName: "Liquidity Mining",
  methodology: "Tracks MPL distributions through V1 staking contracts (RewardPaid events) and direct transfers from predefined reward account addresses",
  isIncentive: true,
  components: [
    {
      id: "v1-staking-rewards",
      name: "V1 Staking Rewards",
      methodology: "Tracks RewardPaid events from 5 MplRewards v1 contracts (Maven11 USDC LP/Staking, Maven11 WETH LP, Orthogonal USDC LP/Staking) on Ethereum.",
      isIncentive: true,
      fetch: v1StakingRewards,
      metadata: {
        contracts: MPL_REWARDS_CONTRACTS,
        chain: "ethereum",
        chainId: "1",
        eventSignature: REWARD_PAID_TOPIC,
      },
    },
    {
      id: "direct-distributions",
      name: "Direct MPL Distributions",
      methodology: "Tracks direct MPL token transfers from predefined reward account addresses (Governor, Reward Wallet), excluding inter-wallet transfers, transfers to MplRewards contracts, and burns.",
      isIncentive: true,
      fetch: directDistributions,
      metadata: {
        sourceAddresses: REWARD_ACCOUNTS,
        chain: "ethereum",
        chainId: "1",
        eventSignature: TRANSFER_TOPIC,
      },
    },
  ],
};

const mpl: ProtocolV2 = {
  "Liquidity Mining": incentivesSection,

  "Treasury": manualCliff(start, treasury),

  "Public Sale": manualCliff(start, publicSale),

  "Team and Advisor": manualLinear(
    start,
    start + periodToSeconds.years(2),
    teamAdvisor
  ),

  "Seed Investors": manualLinear(
    start,
    start + periodToSeconds.years(1.5),
    seed
  ),

  meta: {
    version: 2,
    token: "ethereum:0x643c4e15d7d62ad0abec4a9bd4b001aa3ef52d66",
    sources: ["https://content.forgd.com/p/tokenomics-101-maple-finance"],
    protocolIds: ["parent#maple-finance"],
    notes: [
      "This allocation is based on the old MPL token, which was migrated to SYRUP token.",
      "V1 staking rewards tracked via RewardPaid events from MplRewards contracts",
      "Direct distributions tracked via MPL transfers from predefined reward accounts (Governor, Reward Wallet)",
    ],
  },

  categories: {
    noncirculating: ["Treasury"],
    publicSale: ["Public Sale"],
    farming: ["Liquidity Mining"],
    privateSale: ["Seed Investors"],
    insiders: ["Team and Advisor"],
  },
};

export default mpl;
