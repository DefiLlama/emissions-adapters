import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds, readableToSeconds } from "../utils/time";
import { queryCustom } from "../utils/queries";
const start = 1606741200;
const qty = 100000000;

const STAKING_POOL = "0x6dd655f10d4b9e242ae186d9050b68f725c76d76";
const MINTED_REWARD_TOPIC = "0x6e0fc10bac330e97bc2fd6c13cbb1c1189ddb48a8ce96395650ba8f2bd28f6fc";

const stakingRewards = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3, 64))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '${STAKING_POOL.slice(0, 10)}' AND short_topic0 = '${MINTED_REWARD_TOPIC.slice(0, 10)}'
    WHERE topic0 = '${MINTED_REWARD_TOPIC}'
      AND address = '${STAKING_POOL}'
    GROUP BY date
    ORDER BY date DESC
  `, {});

  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
  }));
};


const api3: Protocol = {
  "Founding Team": [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.05),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year * 3,
      qty * 0.25,
    ),
  ],
  "Partners & Contributors": [
    manualCliff(start + periodToSeconds.month * 6, qty * (0.1 / 6)),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year * 3,
      qty * (0.5 / 6),
    ),
  ],
  "Pre Seed Investors": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    qty * 0.05,
  ),
  "Seed Investors": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    qty * 0.1,
  ),
  "Ecosystem Fund": manualCliff(start, qty * 0.25),
  "Public distribution": manualCliff(start, qty * 0.2),
  "Staking rewards": () => stakingRewards(),
  meta: {
    token: "coingecko:api3",
    sources: [
      "https://medium.com/api3/api3-public-token-distribution-event-1acb3b6d940",
    ],
    notes: ["Inflationary staking rewards are tracked via MintedReward events from the API3 staking pool contract."],
    protocolIds: ["1339"],
    total: qty
  },
  categories: {
    noncirculating: ["Ecosystem Fund"],
    publicSale: ["Public distribution"],
    staking: ["Staking rewards"],
    privateSale: ["Pre Seed Investors","Seed Investors"],
    insiders: ["Founding Team","Partners & Contributors"],
  },
};

export default api3;
