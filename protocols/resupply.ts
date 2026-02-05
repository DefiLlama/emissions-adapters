import { manualCliff, manualLinear } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = readableToSeconds("2025-03-13"); 
const total = 60_000_000;

const emissions = async (): Promise<LinearAdapterResult[]> => {
  const result: LinearAdapterResult[] = [];
  const data = await queryCustom(`SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE short_address = '0x41990500' AND short_topic0 = '0xddf252ad'
WHERE topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  AND topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000'
  AND address = '0x419905009e4656fdc02418c7df35b1e61ed5f726'
  AND transaction_hash IN (
      SELECT transaction_hash
      FROM evm_indexer.logs
      PREWHERE short_address = '0x33333333' AND short_topic0 = '0x5069441a'
      WHERE topic0 = '0x5069441a73f9209e81fd679d5019c55dbf71f8fd068b7fb4992f957a67ec4d56'
        AND address = '0x33333333df05b0d52edd13d230461e5a0f5a4706'
  )
GROUP BY date
ORDER BY date DESC`, {});

data.sort((a, b) => readableToSeconds(a.date) - readableToSeconds(b.date));

for (let i = 0; i < data.length; i++) {
  const currentTimestamp = readableToSeconds(data[i].date);
  const nextTimestamp = i < data.length - 1 
    ? readableToSeconds(data[i + 1].date)
    : currentTimestamp + periodToSeconds.week;

  result.push({
    type: "linear",
    start: currentTimestamp,
    end: nextTimestamp,
    amount: Number(data[i].amount),
  });
  }
  return result;
}

const resupply: Protocol = {
  "Convex Protocol sub-DAO": manualLinear(start, start + periodToSeconds.years(5), total * 0.2),
  "Yearn Protocol sub-DAO": manualLinear(start, start + periodToSeconds.years(5), total * 0.1),
  "Frax Protocol": manualLinear(start, start + periodToSeconds.year, total * 0.05),
  "Prisma Burns": manualLinear(start, start + periodToSeconds.years(5), total * 0.15),
  "Prisma Hack Victims": manualLinear(start, start + periodToSeconds.years(2), total * 0.02),
  "Team": manualLinear(start, start + periodToSeconds.year, total * 0.02),
  "Treasury": manualLinear(start, start + periodToSeconds.years(5), total * 0.105),
  "Emissions": emissions,

  meta: {
    token: `coingecko:resupply`,
    sources: [
      "https://etherscan.io/address/0x33333333df05b0D52edD13D230461E5A0f5a4706",
      "https://docs.resupply.fi/resupply-governance/tokenomics"
    ],
    notes: ["Sub-DAO allocations to be staked perpetually for voting power and revenue to respective protocols"],
    protocolIds: ["5963"]
  },
  categories: {
    insiders: ["Team", "Convex Protocol sub-DAO", "Yearn Protocol sub-DAO", "Frax Protocol", "Prisma Burns"],
    airdrop: ["Prisma Hack Victims"],
    noncirculating: ["Treasury"],
    farming: ["Emissions"],
  }
};

export default resupply;
