import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// V1 IncentivesController on Arbitrum
const V1_INCENTIVES_CONTROLLER = "0xc2054a8c33bfce28de8af4af548c48915c455c13";
const V1_RDNT_TOKEN = "0x0c4681e6c0235179ec3d4f4fc4df3d14fdd96017";
const REWARDS_ACCRUED_TOPIC =
  "0x540798df468d7b23d11f156fdb954cb19ad414d150722a7b6d55ba369dea792e";

const cicContracts = [
  {
    chainId: "42161",
    rdnt: "0x3082cc23568ea640225c2467653db90e9250aaa0",
    cic: "0xebc85d44cefb1293707b11f707bd3cec34b4d5fa",
  },
  {
    chainId: "56",
    rdnt: "0xf7de7e8a6bd59ed41a4b5fe50278b3b7f31384df",
    cic: "0x7c16abb090d3fb266e9d17f60174b632f4229933",
  },
  {
    chainId: "8453",
    rdnt: "0xd722e55c1d9d9fa0021a5215cbb904b92b3dc5d4",
    cic: "0xabc44f1711c94cb72b96bf7dc24b567886359d71",
  },
  {
    chainId: "1",
    rdnt: "0x137ddb47ee24eaa998a535ab00378d6bfa84f893",
    cic: "0x14b0a611230dc48e9cc048d3ae5279847bf30919",
  },
];

const v1Incentives = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(
    `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(SUBSTRING(data, 3, 64))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '${V1_INCENTIVES_CONTROLLER.slice(0, 10)}' AND short_topic0 = '${REWARDS_ACCRUED_TOPIC.slice(0, 10)}'
    WHERE topic0 = '${REWARDS_ACCRUED_TOPIC}'
      AND address = '${V1_INCENTIVES_CONTROLLER}'
      AND topic2 = '0x000000000000000000000000${V1_RDNT_TOKEN.substring(2).toLowerCase()}'
    GROUP BY date
    ORDER BY date DESC
  `,
    {},
  );

  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false
  }));
};

const v2Incentives = async (): Promise<CliffAdapterResult[]> => {
  const results: CliffAdapterResult[] = [];

  for (const c of cicContracts) {
    const paddedCic = `0x000000000000000000000000${c.cic.substring(2)}`;
    const data = await queryCustom(
      `
      SELECT
        toStartOfDay(timestamp) AS date,
        SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
      FROM evm_indexer.logs
      PREWHERE chain = '${c.chainId}' AND short_address = '${c.rdnt.slice(0, 10)}' AND short_topic0 = '${TRANSFER_TOPIC.slice(0, 10)}'
      WHERE topic0 = '${TRANSFER_TOPIC}'
        AND address = '${c.rdnt}'
        AND topic1 = '${paddedCic}'
      GROUP BY date
      ORDER BY date DESC
    `,
      {},
    );

    for (const d of data) {
      results.push({
        type: "cliff",
        start: readableToSeconds(d.date),
        amount: Number(d.amount),
        isUnlock: false
      });
    }
  }

  return results;
};

const incentiveSection: SectionV2 = {
  displayName: "Incentives",
  methodology:
    "RDNT emissions to lenders and borrowers who lock dLP tokens across all chains",
  isIncentive: true,
  components: [
    {
      id: "v1-incentives",
      name: "V1 Lending/Borrowing Rewards Emissions",
      methodology:
        "Tracks RewardsAccrued events from V1 IncentivesController on Arbitrum, filtered to RDNT token rewards",
      isIncentive: true,
      fetch: v1Incentives,
      metadata: {
        contract: V1_INCENTIVES_CONTROLLER,
        chain: "arbitrum",
        chainId: "42161",
        eventSignature: REWARDS_ACCRUED_TOPIC,
      },
    },
    {
      id: "v2-incentives",
      name: "V2 Lending/Borrowing Rewards Emissions",
      methodology:
        "Tracks RDNT V2 transfers from ChefIncentivesController contracts on Arbitrum, BSC, Base, and Ethereum",
      isIncentive: true,
      fetch: v2Incentives,
      metadata: {
        contracts: cicContracts.map((c) => c.cic),
        chains: ["arbitrum", "bsc", "base", "ethereum"],
        chainIds: cicContracts.map((c) => c.chainId),
        eventSignature: TRANSFER_TOPIC,
      },
    },
  ],
};

const radiant: ProtocolV2 = {
  "Incentives": incentiveSection,
  meta: {
    version: 2,
    token: "arbitrum:0x3082cc23568ea640225c2467653db90e9250aaa0",
    sources: [
      "https://docs.radiant.capital/radiant/project-info/rdnt-tokenomics",
      "https://docs.radiant.capital/radiant/contracts-and-security",
    ],
    protocolIds: ["parent#radiant"],
    notes: [
      "RDNT migrated from V1 (1B supply) to V2 (1.5B supply) in March 2023",
      "Incentive emissions require locking dLP (RDNT-ETH LP) for eligibility",
      "Only incentive emissions are tracked"
    ],
    incentivesOnly: true
  },
  categories: {
    farming: ["Incentives"]
  },
};

export default radiant;
