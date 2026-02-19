import { balance, latest } from "../adapters/balance";
import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { queryCustom, toShort } from "../utils/queries";
import { periodToSeconds, readableToSeconds, unixTimestampNow } from "../utils/time";

const start = 1732233600; // Nov'24
const tge = 1700697600; // Nov'23
const token = "0x826180541412d574cf1336d22c0c0a287822678a";
const chain = "ethereum";
const now = unixTimestampNow()
const elapsed = now - start
const monthsPassed = Math.floor(elapsed / periodToSeconds.month)
const emissionsPerMonth = 352_000

const contributorsAddress = "0xce317d9909f5ddd30dcd7331f832e906adc81f5d";
const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function queryContributorTransfers() {
  const sql = `
    SELECT toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '${toShort(token)}'
      AND short_topic0 = '${toShort(transferTopic)}'
    WHERE address = '${token}'
      AND topic0 = '${transferTopic}'
      AND topic1 = lower(concat('0x', lpad(substring('${contributorsAddress}', 3), 64, '0')))
    GROUP BY date ORDER BY date ASC`;

  const data = await queryCustom(sql, {});
  return data.filter(d => readableToSeconds(d.date) >= start).map((d) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
  }));
}
 

const chainflip: Protocol = {
  "Node Operators Programs": manualCliff(start, 4_750_000),
  "Token Sale": manualCliff(start, 2_066_314),
  "Liquid Treasury": manualCliff(start, 4_968_503),
  "Strategic Investors": manualCliff(start, 34_181_497),
  "Oxen Foundation": manualCliff(start, 4_200_000),
  Contributors: queryContributorTransfers,
  "Treasury Reserves": [],
  "Protocol Emissions": manualLinear(start, now, emissionsPerMonth * monthsPassed),
  meta: {
    notes: [
      `Treasury Reserve (22%) has been ignored from this analysis since its token balance will remain neutral over time.`,
      "Protocol emissions are calculated at a rate of 352,000 FLIP per month, as specified in the sources"
    ],
    token: `${chain}:${token}`,
    sources: [
      "https://docs.chainflip.io/concepts/token-economics/genesis-tokenomics",
      "https://docs.chainflip.io/protocol/token-economics/current-token-economics-2025-and-beyond"
    ],
    protocolIds: ["3853"],
  },
  categories: {
    staking: ["Protocol Emissions"],
    farming: ["Node Operators Programs"],
    publicSale: ["Token Sale"],
    noncirculating: ["Liquid Treasury", "Treasury Reserves"],
    privateSale: ["Strategic Investors"],
    insiders: ["Oxen Foundation", "Contributors"],
  },
};

export default chainflip;
