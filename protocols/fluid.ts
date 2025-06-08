import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import adapter from "../adapters/fluid";
import { readableToSeconds } from "../utils/time";
import { queryAggregatedDailyLogsAmounts, queryAggregatedDailyLogsAmountsMulti, queryCustom } from "../utils/queries";
const rewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 67, 64))))) / 1e18 AS amount
FROM evm_indexer.logs
where topic0 = '0x309cb1c0dc6ce0f02c0c35cc1f46bbe61ec9deb311d101b87e7d25bd0b647fd7'
and address in (
'0x7060fe0dd3e31be01efac6b28c8d38018fd163b0',
'0xbabb3f87424d900abd83c807c1e01a22a54e726f',
'0xb48bbe313edb7faaa28c03684d48f58dd7dea239',
'0xd833484b198d3d05707832cc1c2d62b520d95b8a'
)
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

const stakeRewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryAggregatedDailyLogsAmountsMulti({
    addresses: ["0x2fA6c95B69c10f9F52b8990b6C03171F13C46225", "0x490681095ed277B45377d28cA15Ac41d64583048"],
    topic0: "0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486",
    startDate: "2024-02-22"
  })

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount)
    });
  }
  return result;
}

const fluid: Protocol = {
  "Airdrop": [
    manualCliff("2021-06-16", 10_000_000),
    manualCliff("2021-06-16", 1_000_000),
  ],
  "Liquidity Mining": manualLinear(
    "2021-06-16",
    "2021-09-16",
    3_000_000
  ),
  "UNI-v3 Staking": manualLinear(
    "2021-06-16",
    "2021-09-16",
    1_000_000
  ),

  "Vested Allocations": () => adapter(),

  "Rewards": [rewards, stakeRewards],


  meta: {
    sources: [
      "https://etherscan.io/address/0x3b05a5295Aa749D78858E33ECe3b97bB3Ef4F029",
      "https://blog.instadapp.io/inst/",
      "https://github.com/Instadapp/fluid-contracts-public/blob/main/deployments/deployments.md"
    ],
    token: "coingecko:instadapp",
    protocolIds: ["parent#fluid"],
    notes: [
      "INST token was rebranded to FLUID",
      "40M tokens reserved for future community initiatives governed by DAO.",
      "Rewards are based on distributor contracts from GitHub",
      "Vested Allocations should be 45M total, including Team (23.8M), Investors (12.1M), Future Team (7.8M), and Advisors (1.3M) with 4-year vesting schedules",
      "However based on onchain data, only 37.293.668 tokens are vested",
      "Due to the nature of the vesting contracts, we cannot determine the exact amounts for each allocation",
    ]
  },
  categories: {
    insiders: ["Vested Allocations"],
    farming: ["Liquidity Mining", "UNI-v3 Staking", "Rewards"],
    noncirculating: ["Future Community Initiatives"],
  }
};

export default fluid;
