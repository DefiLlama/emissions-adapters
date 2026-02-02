import { manualCliff, manualLinear } from "../adapters/manual";
import { supply } from "../adapters/supply";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const deployTime = 1621292400;
const chain: any = "ethereum";
const CVX: string = "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b";
const TREASURY_ADDRESS = "0x1389388d01708118b497f59521f6943be2541bb7";
const EXCLUDED_TO_ADDRESS = "0x5f465e9fcffc217c5849906216581a657cd60605";
const REWARD_CONTRACT = "0x449f2fd99174e1785cf2a1c79e665fec3dd1ddc6";
const REWARD_PAID_TOPIC = "0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const stakingRewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];

  const rewardPaidSql = `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    WHERE address = {rewardContract:String}
      AND topic0 = {rewardTopic:String}
      AND topic1 != {treasuryTopic:String}
      AND timestamp >= toDateTime({startDate:String})
    GROUP BY date
    ORDER BY date ASC
  `;

  const data = await queryCustom(rewardPaidSql, {
    rewardContract: REWARD_CONTRACT,
    rewardTopic: REWARD_PAID_TOPIC,
    treasuryTopic: `0x000000000000000000000000${TREASURY_ADDRESS.substring(2).toLowerCase()}`,
    startDate: "2021-05-17"
  });

  for (const item of data) {
    result.push({
      type: "cliff",
      start: readableToSeconds(item.date),
      amount: Number(item.amount),
    });
  }

  return result;
};

const treasuryDistributions = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];

  const treasuryExpensesSql = `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    WHERE address = {cvxToken:String}
      AND topic0 = '${TRANSFER_TOPIC}'
      AND topic1 = {treasuryFromTopic:String}
      AND topic2 != {excludedToTopic:String}
      AND timestamp >= toDateTime({startDate:String})
    GROUP BY date
    ORDER BY date ASC
  `;

  const data = await queryCustom(treasuryExpensesSql, {
    cvxToken: CVX,
    treasuryFromTopic: `0x000000000000000000000000${TREASURY_ADDRESS.substring(2).toLowerCase()}`,
    excludedToTopic: `0x000000000000000000000000${EXCLUDED_TO_ADDRESS.substring(2).toLowerCase()}`,
    startDate: "2021-05-17"
  });

  for (const item of data) {
    result.push({
      type: "cliff",
      start: readableToSeconds(item.date),
      amount: Number(item.amount),
    });
  }

  return result;
};

const stakingSection: SectionV2 = {
  displayName: "Staking Rewards",
  methodology: "Tracks CVX rewards distributed to token holders through staking",
  isIncentive: true,
  components: [
    {
      id: "staking-rewards",
      name: "cvxCRV Staking Rewards",
      methodology: "Tracks RewardPaid events from cvxCRV staking contract, excluding rewards sent to treasury. These rewards go to token holders who stake their cvxCRV.",
      isIncentive: true,
      fetch: stakingRewards,
      metadata: {
        contract: REWARD_CONTRACT,
        chain: "ethereum",
        chainId: "1",
        eventSignature: REWARD_PAID_TOPIC,
      },
    },
  ],
};

const farmingSection: SectionV2 = {
  displayName: "Farming Incentives",
  methodology: "Tracks CVX incentives distributed to external parties (LPs, partners, etc.)",
  isIncentive: true,
  components: [
    {
      id: "treasury-distributions",
      name: "Treasury Distributions",
      methodology: "Tracks CVX transfers from treasury to external addresses, excluding Masterchef recycling. These go to LPs, partners, and other non-token-holder recipients.",
      isIncentive: true,
      fetch: treasuryDistributions,
      metadata: {
        contract: CVX,
        treasury: TREASURY_ADDRESS,
        chain: "ethereum",
        chainId: "1",
        eventSignature: TRANSFER_TOPIC,
      },
    },
  ],
};

const convex: ProtocolV2 = {
  Investors: manualLinear(
      deployTime,
      deployTime + periodToSeconds.year,
      3300000,
  ),
  Treasury: manualLinear(
      deployTime,
      deployTime + periodToSeconds.year,
      9700000,
  ),
  Team: manualLinear(deployTime, deployTime + periodToSeconds.year, 10000000),
  "veCRV voters": manualCliff(deployTime, 1000000),
  "veCRV holders": manualCliff(deployTime, 1000000),
  "Liquidity mining": manualLinear(
      deployTime,
      deployTime + 4 * periodToSeconds.year,
      25000000,
  ),
  "Curve LP rewards": () =>
      supply(chain, CVX, deployTime, "convex-finance", 50000000),
  "Staking Rewards": stakingSection,
  "Farming Incentives": farmingSection,
  meta: {
    version: 2,
    sources: [
      "https://docs.convexfinance.com/convexfinance/general-information/tokenomics",
    ],
    token: `${chain}:${CVX}`,
    protocolIds: ["319"],
    incompleteSections: [
      {
        key: "Curve LP rewards",
        allocation: 50000000,
        lastRecord: () => 1621292400,
      },
    ],
  },
  categories: {
    noncirculating: ["Treasury"],
    airdrop: ["veCRV voters","veCRV holders"],
    staking: ["Staking Rewards"],
    farming: ["Farming Incentives"],
    privateSale: ["Investors"],
    insiders: ["Team"],
  },
};

export default convex;
