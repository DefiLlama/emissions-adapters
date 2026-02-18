import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const LON_TOKEN = "0x0000000000095413afc295d19edeb1ad7b71c952";
const MERKLE_REDEEM = "0x0000000006a0403952389b70d8ee4e45479023db";
const STAKING_REWARDS = "0x929cf614c917944dd278bc2134714eaa4121bc6a";


const CLAIMED_SIG = "0xd8138f8a3f377c5259ca548e70e4c2de94f129f5a11036a15b69513cba2b426a";
const REWARD_PAID_SIG = "0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486";

const miningRewards = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '1' AND short_address = '${MERKLE_REDEEM.slice(0, 10)}' AND short_topic0 = '${CLAIMED_SIG.slice(0, 10)}'
    WHERE topic0 = '${CLAIMED_SIG}'
      AND address = '${MERKLE_REDEEM}'
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

const stakingRewards = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '1' AND short_address = '${STAKING_REWARDS.slice(0, 10)}' AND short_topic0 = '${REWARD_PAID_SIG.slice(0, 10)}'
    WHERE topic0 = '${REWARD_PAID_SIG}'
      AND address = '${STAKING_REWARDS}'
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

const incentivesSection: SectionV2 = {
  displayName: "LON Incentives",
  methodology: "Tracks LON token distributions to users through mining and staking rewards programs",
  isIncentive: true,
  components: [
    {
      id: "mining-rewards",
      name: "Mining Rewards",
      methodology: "Tracks LON claimed from MerkleRedeem contract. Users earn LON through liquidity mining programs.",
      isIncentive: true,
      fetch: miningRewards,
      metadata: {
        contract: "0x0000000006a0403952389b70d8ee4e45479023db",
        chain: "ethereum",
        chainId: "1",
        eventSignature: CLAIMED_SIG,
      },
    },
    {
      id: "staking-rewards",
      name: "Staking Rewards",
      methodology: "Tracks LON rewards paid from StakingRewards contract. Users stake LON and receive rewards from trading fees.",
      isIncentive: true,
      fetch: stakingRewards,
      metadata: {
        contract: "0x929cf614c917944dd278bc2134714eaa4121bc6a",
        chain: "ethereum",
        chainId: "1",
        eventSignature: REWARD_PAID_SIG,
      },
    },
  ],
};

const tokenlon: ProtocolV2 = {
  "Incentives": incentivesSection,

  meta: {
    version: 2,
    token: `ethereum:${LON_TOKEN}`,
    sources: [
      "https://tokenlon.im/lon/staking",
      "https://etherscan.io/address/0x0000000006a0403952389b70d8ee4e45479023db",
      "https://etherscan.io/address/0x929cf614c917944dd278bc2134714eaa4121bc6a",
    ],
    protocolIds: ["parent#tokenlon"],
    notes: [
      "Mining rewards distributed via MerkleRedeem (Claimed events)",
      "Staking rewards distributed via StakingRewards (RewardPaid events)",
      "60% of trading fees go to LON stakers",
    ],
  },

  categories: {
    farming: ["Incentives"],
  },
};

export default tokenlon;
