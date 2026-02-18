import { manualCliff, manualStep } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const qty = 100000000;
const start = 1617577200;

const STABILITY_POOL_CONTRACT = "0x66017d22b0f8556afdd19fc67041899eb65a21bb";
const UNISWAP_STAKING_CONTRACT = "0xd37a77e71ddf3373a79be2ebb76b6c4808bdf0d5";
const LQTY_PAID_TOPIC = "0x2608b986a6ac0f6c629ca37018e80af5561e366252ae93602a96d3ab2e73e42d";
const LQTY_SENT_TOPIC = "0xcd2cdc1a4af71051394e9c6facd9a266b2ac5bd65d219a701eeda009f47682bf";
const REWARD_PAID_TOPIC = "0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486";

const stabilityPoolRewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE short_address = '${STABILITY_POOL_CONTRACT.slice(0, 10)}' AND short_topic0 IN ('${LQTY_PAID_TOPIC.slice(0, 10)}', '${LQTY_SENT_TOPIC.slice(0, 10)}')
WHERE address = '${STABILITY_POOL_CONTRACT}'
  AND (topic0 = '${LQTY_PAID_TOPIC}'
       OR topic0 = '${LQTY_SENT_TOPIC}')
GROUP BY date
ORDER BY date DESC`, {})

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount)
    });
  }
  return result;
}

const uniswapLPRewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE short_address = '${UNISWAP_STAKING_CONTRACT.slice(0, 10)}' AND short_topic0 = '${REWARD_PAID_TOPIC.slice(0, 10)}'
WHERE address = '${UNISWAP_STAKING_CONTRACT}'
  AND topic0 = '${REWARD_PAID_TOPIC}'
GROUP BY date
ORDER BY date DESC`, {})

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount)
    });
  }
  return result;
}

const incentivesSection: SectionV2 = {
  displayName: "Incentives",
  methodology: "Tracks LQTY rewards distributed to Stability Pool depositors and Uniswap LPs",
  isIncentive: true,
  components: [
    {
      id: "stability-pool-rewards",
      name: "Stability Pool Rewards",
      methodology: "Tracks LQTYPaidToDepositor and LQTYPaidToFrontEnd events from Stability Pool contract",
      isIncentive: true,
      fetch: stabilityPoolRewards,
      metadata: {
        contract: STABILITY_POOL_CONTRACT,
        chain: "ethereum",
        chainId: "1",
        eventSignatures: [LQTY_PAID_TOPIC, LQTY_SENT_TOPIC],
      },
    },
    {
      id: "uniswap-lp-rewards",
      name: "Uniswap LP Rewards",
      methodology: "Tracks RewardPaid events from LQTY-ETH Uniswap LP staking contract",
      isIncentive: true,
      fetch: uniswapLPRewards,
      metadata: {
        contract: UNISWAP_STAKING_CONTRACT,
        chain: "ethereum",
        chainId: "1",
        eventSignature: REWARD_PAID_TOPIC,
      },
    },
  ],
};

const liquity: ProtocolV2 = {
  "Incentives": incentivesSection,
  "Community reserve": manualCliff(start, qty * 0.02),
  Endowment: manualCliff(start + periodToSeconds.year, qty * 0.0606),
  "Team and advisors": [
    manualCliff(start + periodToSeconds.year, qty * 0.2665 * 0.25),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      27,
      (qty * 0.2665 * 0.75) / 27,
    ),
  ],
  "Service providers": manualCliff(start + periodToSeconds.year, qty * 0.0104),
  Investors: manualCliff(start + periodToSeconds.year, qty * 0.339),
  meta: {
    version: 2,
    sources: ["https://medium.com/liquity/liquity-launch-details-4537c5ffa9ea"],
    token: "ethereum:0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d",
    protocolIds: ["270"],
  },
  categories: {
    farming: ["Incentives"],
    noncirculating: ["Endowment","Community reserve"],
    privateSale: ["Investors"],
    insiders: ["Team and advisors","Service providers"],
  },
};
export default liquity;
