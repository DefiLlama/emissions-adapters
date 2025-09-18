import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";

const spark: Protocol = {
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
        token: "coingecko:spark-2",
        protocolIds: ["parent#spark"],
    },
    categories: {
        noncirculating: ["Ecosystem"],
        insiders: ["Team"],
    },
};
export default spark;
