import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import {
  periodToSeconds,
  readableToSeconds,
  years,
} from "../utils/time";
import { queryCustom, queryDailyOutflows, toShort } from "../utils/queries";

const tge = 1700697600; // Nov 23, 2023
const token = "0x826180541412d574cf1336d22c0c0a287822678a";
const chain = "ethereum";
const genesis = 90_000_000;
const docsGenesisTotal = 85_166_314;
const contributorsAddress = "0xce317d9909f5ddd30dcd7331f832e906adc81f5d";

const FLIP_SUPPLY_UPDATED =
  "0xff4b7a826623672c6944dc44d809008e2e1105180d110fd63986e841f15eb2ad";
const gatewayAddress = "0x6995ab7c4d7f4b03f467cf4c8e920427d9621dbd";

async function getOutflows() {
  const data = await queryDailyOutflows({
    token: token,
    fromAddress: contributorsAddress,
    startDate: "2023-11-23",
  });
  return data.map((d) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: true
  }));
}

async function getNetSupplyChanges(): Promise<CliffAdapterResult[]> {
  const sql = `
    SELECT toUnixTimestamp(toStartOfDay(timestamp)) AS date,
      SUM(
        toInt256(reinterpretAsUInt256(reverse(unhex(substring(data, 67, 64)))))
        - toInt256(reinterpretAsUInt256(reverse(unhex(substring(data, 3, 64)))))
      ) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '${toShort(gatewayAddress)}'
      AND short_topic0 = '${toShort(FLIP_SUPPLY_UPDATED)}'
    WHERE address = '${gatewayAddress}'
      AND topic0 = '${FLIP_SUPPLY_UPDATED}'
      AND timestamp >= toDateTime('2023-11-23')
    GROUP BY date ORDER BY date ASC
  `;
  const data = await queryCustom(sql, {});
  return data.map((d) => ({
    type: "cliff" as const,
    start: Number(d.date),
    amount: Number(d.amount),
    isUnlock: false
  }));
}

const chainflip: Protocol = {
  "Token Sale": manualCliff(tge, 2_066_314),
  "Node Operators Program": manualCliff(tge, 4_750_000),
  "Other Allocations": manualCliff(tge, genesis - docsGenesisTotal),
  "Strategic Investors": [
    manualCliff(tge, 34_181_497 * 0.2),
    manualLinear(tge, years(tge, 1), 34_181_497 * 0.8),
  ],
  "Oxen Foundation": manualCliff(tge, 4_200_000),
  "Liquid Treasury": manualCliff(tge, 4_968_503),
  "Treasury Reserves": manualCliff(tge, 22_000_000),
  "Contributors": [
    getOutflows,
  ],
  "Net Emissions": getNetSupplyChanges,
  meta: {
    token: `${chain}:${token}`,
    notes: [
      "Net Emissions track new mints and burns from the FlipSupplyUpdated event of the StateChainGateway contract.",
    ],
    sources: [
      "https://docs.chainflip.io/protocol/token-economics/genesis-token-economics-pre-2023",
      "https://docs.chainflip.io/protocol/token-economics/current-token-economics-2025-and-beyond",
      "https://etherscan.io/address/0x6995ab7c4d7f4b03f467cf4c8e920427d9621dbd",
    ],
    protocolIds: ["parent#chainflip"],
  },
  categories: {
    publicSale: ["Token Sale"],
    privateSale: ["Strategic Investors", "Other Allocations"],
    insiders: ["Oxen Foundation", "Contributors", "Liquid Treasury", "Treasury Reserves"],
    airdrop: ["Node Operators Program"],
    staking: ["Net Emissions"],
  },
};

export default chainflip;
