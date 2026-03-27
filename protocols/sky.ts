import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { readableToSeconds } from "../utils/time";
import {
  queryAggregatedDailyLogsAmounts,
  queryCustom,
} from "../utils/queries";

const SKY_TOKEN = "0x56072c95faa701256059aa122697b133aded9279";
const INCENTIVES = "0x0650caf159c5a49f711e8169d4336ecb9b950275";
const VESTED_REWARDS_DISTRIBUTION = "0x2f0c88e935db5a60dda73b0b4eaeef55883896d9"
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const REWARD_PAID_TOPIC =
  "0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486";
const ZERO_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const padAddress = (addr: string) =>
  `0x${addr.substring(2).toLowerCase().padStart(64, "0")}`;

const netMkrMigration = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(
    `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(
        CASE
          WHEN topic1 = {zeroTopic:String} THEN toInt256(reinterpretAsUInt256(reverse(unhex(substring(data, 3)))))
          WHEN topic2 = {zeroTopic:String} THEN -1 * toInt256(reinterpretAsUInt256(reverse(unhex(substring(data, 3)))))
          ELSE toInt256(0)
        END
      ) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '${SKY_TOKEN.slice(0, 10)}' AND short_topic0 = '${TRANSFER_TOPIC.slice(0, 10)}'
    WHERE address = {skyToken:String}
      AND topic0 = '${TRANSFER_TOPIC}'
      AND (topic1 = {zeroTopic:String} OR topic2 = {zeroTopic:String})
      AND NOT (topic1 = {zeroTopic:String} AND topic2 = {incentivesTopic:String})
    GROUP BY date
    ORDER BY date ASC
  `,
    {
      skyToken: SKY_TOKEN,
      zeroTopic: ZERO_TOPIC,
      incentivesTopic: padAddress(VESTED_REWARDS_DISTRIBUTION),
    },
  );

  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
  }));
};

const incentivesRewards = async (): Promise<CliffAdapterResult[]> => {
  const issuanceData = await queryAggregatedDailyLogsAmounts({
    address: INCENTIVES,
    topic0: REWARD_PAID_TOPIC,
    startDate: "2024-09-24",
  });

  return issuanceData.map((d) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount) / 1e18,
  }));
};

const migrationSection: SectionV2 = {
  displayName: "Net MKR Migration",
  methodology:
    "Tracks net SKY token supply changes: mints (Transfer from zero address) minus burns (Transfer to zero address), excluding mints to the incentives contract which are tracked separately. Includes MKR-to-SKY converter pre-mints, governance allocations, DEX liquidity, treasury distributions, and supply destruction from reverse conversions and smart burn engine.",
  isIncentive: false,
  components: [
    {
      id: "net-mkr-migration",
      name: "Net MKR Migration",
      methodology:
        "Net daily SKY supply change from mints and burns on the SKY token contract, excluding incentive mints. SKY replaced MKR via a 1:24,000 conversion ratio starting Sep 2024.",
      isIncentive: false,
      fetch: netMkrMigration,
      metadata: {
        contract: SKY_TOKEN,
        chain: "ethereum",
        chainId: "1",
        eventSignature: TRANSFER_TOPIC,
      },
    },
  ],
};

const incentivesSection: SectionV2 = {
  displayName: "Sky Incentives",
  methodology:
    "Tracks SKY farming rewards distributed through the Sky Incentives contract.",
  isIncentive: true,
  components: [
    {
      id: "farming-rewards",
      name: "Farming Rewards",
      methodology:
        "Tracks RewardPaid events from the Sky Incentives contract, representing SKY distributed to liquidity providers and stakers.",
      isIncentive: true,
      fetch: incentivesRewards,
      metadata: {
        contract: INCENTIVES,
        chain: "ethereum",
        chainId: "1",
        eventSignature: REWARD_PAID_TOPIC,
      },
    },
  ],
};

const sky: ProtocolV2 = {
  "Net MKR Migration": migrationSection,
  "Sky Incentives": incentivesSection,
  meta: {
    version: 2,
    sources: [
      "https://developers.skyeco.com/protocol/tokens/sky/",
      "https://developers.skyeco.com/guides/sky/token-governance-upgrade/key-info/",
    ],
    token: "coingecko:sky",
    protocolIds: ["parent#maker"],
    notes: [
      "SKY replaced MKR via a 1:24,000 conversion ratio starting Sep 2024.",
      "Net MKR Migration tracks all supply mints minus burns, excluding incentive mints.",
      "Sky Incentives tracks farming reward distributions separately.",
    ],
  },
  categories: {
    migration: ["Net MKR Migration"],
    farming: ["Sky Incentives"],
  },
};

export default sky;
