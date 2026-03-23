import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const LOOT = "0x00e701eff4f9dc647f1510f835c5d1ee7e41d28f";
const GRID_MINING = "0xa8e2f506adcbbf18733a9f0f32e3d70b1a34d723";

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ZERO_ADDRESS_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const GRID_MINING_TOPIC = `0x000000000000000000000000${GRID_MINING.slice(2)}`;

type EmissionRow = {
  date: string;
  amount: string;
};

const miningEmissions = async (): Promise<CliffAdapterResult[]> => {
  const data = (await queryCustom(
    `SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '${LOOT.slice(0, 10)}'
      AND short_topic0 = '${TRANSFER_TOPIC.slice(0, 10)}'
    WHERE address = '${LOOT}'
      AND topic0 = '${TRANSFER_TOPIC}'
      AND topic1 = '${ZERO_ADDRESS_TOPIC}'
      AND topic2 = '${GRID_MINING_TOPIC}'
      AND timestamp >= toDateTime('2026-03-09')
    GROUP BY date
    ORDER BY date ASC`,
    {}
  )) as EmissionRow[];

  return data.map((d) => ({
    type: "cliff",
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
  }));
};

const mineloot: Protocol = {
  "Mining Emissions": miningEmissions,
  meta: {
    token: `base:${LOOT}`,
    sources: [
      "https://basescan.org/token/0x00E701Eff4f9Dc647f1510f835C5d1ee7E41D28f",
      "https://basescan.org/address/0xA8E2F506aDcbBF18733A9F0f32e3D70b1A34d723",
    ],
    notes: [
      "Tracks LOOT minted from zero address directly to GridMining (round emissions).",
      "Constructor mint to owner is excluded by topic2 filter.",
    ],
    protocolIds: [""],
  },
  categories: {
    farming: ["Mining Emissions"],
  },
};

export default mineloot;
