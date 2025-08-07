import { CliffAdapterResult, Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { readableToSeconds } from "../utils/time";
import { queryCustom } from "../utils/queries";

const rewards = async (): Promise<CliffAdapterResult[]> => {
    const result: CliffAdapterResult[] = [];
    const rewardPaidSql = `
    SELECT
  toStartOfDay(timestamp) AS date,
  SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
WHERE address IN (
    '0x173e314c7635b45322cd8cb14f44b312e079f3af',
    '0x99cbc0e4e6427f6939536ed24d1275b95ff77404'
)
  AND topic0 = '0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486'
  AND timestamp >= toDateTime({startDate:String})
GROUP BY date
ORDER BY date ASC
  `;

    const data = await queryCustom(rewardPaidSql, {
        startDate: "2025-06-30"
    });

    for (let i = 0; i < data.length; i++) {
        result.push({
            type: "cliff",
            start: readableToSeconds(data[i].date),
            amount: Number(data[i].amount)
        });
    }
    return result;
}

const spark: Protocol = {
    "Sky Farming": [
        rewards
    ],
    "Ecosystem": [
        manualCliff('2025-06-17', 2_300_000_000 * 0.17),
        manualCliff('2026-06-17', 2_300_000_000 * 0.83),
    ],
    "Team": [
        manualCliff('2026-06-17', 1_200_000_000 * 0.25),
        manualLinear('2026-06-17', '2029-06-17', 1_200_000_000 * 0.75),
    ],
    meta: {
        sources: [
            "https://docs.spark.fi/governance/spk-token",
        ],
        notes: ["Sky Farming rewards are only counted when users have claimed them."],
        token: "coingecko:spark-2",
        protocolIds: ["parent#spark"],
    },
    categories: {
        farming: ["Sky Farming"],
        noncirculating: ["Ecosystem"],
        insiders: ["Team"],
    },
};
export default spark;
