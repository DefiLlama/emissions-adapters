import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = 1658685600;
const qty = 1000000000;

const INCENTIVES_CONTROLLER = "0xc2054a8c33bfce28de8af4af548c48915c455c13";
const RDNT_TOKEN = "0x0c4681e6c0235179ec3d4f4fc4df3d14fdd96017";
const STAKING_CONTRACTS = [
  "0x76ba3ec5f5adbf1c58c91e86502232317eea72de",
  "0x4fd9f7c5ca0829a656561486bada018505dfcb5e"
];
const REWARDS_ACCRUED_TOPIC = "0x540798df468d7b23d11f156fdb954cb19ad414d150722a7b6d55ba369dea792e";
const REWARD_CLAIMED_TOPIC = "0xa236f2dcd2b940fd86168787a5f820805cdbd85131f7192d9d9c418556876fca";

const lendingRewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(SUBSTRING(data, 3, 64))))) / 1e18 AS amount
    FROM evm_indexer.logs
    WHERE topic0 = '${REWARDS_ACCRUED_TOPIC}'
      AND address = '${INCENTIVES_CONTROLLER}'
      AND topic2 = '0x000000000000000000000000${RDNT_TOKEN.substring(2).toLowerCase()}'
    GROUP BY date
    ORDER BY date DESC
  `, {});

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount),
    });
  }
  return result;
};

const stakingRewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const addressList = STAKING_CONTRACTS.map(a => `'${a}'`).join(', ');
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(SUBSTRING(data, 3, 64))))) / 1e18 AS amount
    FROM evm_indexer.logs
    WHERE topic0 = '${REWARD_CLAIMED_TOPIC}'
      AND address IN (${addressList})
    GROUP BY date
    ORDER BY date DESC
  `, {});

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount),
    });
  }
  return result;
};

const stakingSection: SectionV2 = {
  displayName: "Staking Rewards",
  methodology: "Tracks RDNT rewards distributed to dLP stakers (RDNT-ETH LP holders)",
  isIncentive: true,
  components: [
    {
      id: "dlp-staking-rewards",
      name: "dLP Staking Rewards",
      methodology: "Tracks RewardClaimed events from dLP staking contracts. These rewards go to users who stake RDNT-ETH LP tokens, which requires holding RDNT.",
      isIncentive: true,
      fetch: stakingRewards,
      metadata: {
        contracts: STAKING_CONTRACTS,
        chain: "arbitrum",
        chainId: "42161",
        eventSignature: REWARD_CLAIMED_TOPIC,
      },
    },
  ],
};

const farmingSection: SectionV2 = {
  displayName: "Farming Incentives",
  methodology: "Tracks RDNT rewards distributed to lenders and borrowers",
  isIncentive: true,
  components: [
    {
      id: "lending-rewards",
      name: "Lending/Borrowing Rewards",
      methodology: "Tracks RewardsAccrued events from IncentivesController for supply/borrow rewards. These go to protocol users, not necessarily RDNT holders.",
      isIncentive: true,
      fetch: lendingRewards,
      metadata: {
        contract: INCENTIVES_CONTROLLER,
        chain: "arbitrum",
        chainId: "42161",
        eventSignature: REWARDS_ACCRUED_TOPIC,
      },
    },
  ],
};

const radiant: ProtocolV2 = {
  treasury: manualCliff(start, qty * 0.03),
  "dao reserve": manualCliff(start, qty * 0.14),
  "core contributors and advisors": manualLinear(
    start,
    start + periodToSeconds.year * 1.5,
    qty * 0.07,
  ),
  team: [
    manualLinear(
      start + periodToSeconds.month * 3,
      start + periodToSeconds.month * 60,
      qty * 0.2 * 0.9,
    ),
    manualCliff(start + periodToSeconds.month * 3, qty * 0.2 * 0.1),
  ],
  "Staking Rewards": stakingSection,
  "Farming Incentives": farmingSection,
  meta: {
    version: 2,
    token: "arbitrum:0x0c4681e6c0235179ec3d4f4fc4df3d14fdd96017",
    sources: [
      "https://docs.radiant.capital/radiant/project-info/rdnt-tokenomics",
    ],
    protocolIds: ["parent#radiant"],
  },
  categories: {
    noncirculating: ["treasury", "dao reserve"],
    staking: ["Staking Rewards"],
    farming: ["Farming Incentives"],
    insiders: ["core contributors and advisors", "team"],
  },
};

export default radiant;
