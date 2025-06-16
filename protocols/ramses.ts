import { LinearAdapterResult, Protocol } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";


const emissions = async (): Promise<LinearAdapterResult[]> => {
  const result: LinearAdapterResult[] = [];
  const data = await queryCustom(`SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
WHERE topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  AND topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000'
  AND address = '0xaaa6c1e32c55a7bfa8066a6fae9b42650f262418'
  AND transaction_hash IN (
      SELECT transaction_hash 
      FROM evm_indexer.logs
      WHERE topic0 = '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f'
        AND address = '0xaaaa0b6baefaec478eb2d1337435623500ad4594'
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

const ramses: Protocol = {
  "Emissions": emissions,

  meta: {
    notes: [
        "This page is used to track the emissions of Ramses mint only",
    ],
    token: `arbitrum:0xaaa6c1e32c55a7bfa8066a6fae9b42650f262418`,
    sources: [
      "https://docs.ramses.exchange/resources/deployed-contract-addresses"
    ],
    protocolIds: ["parent#ramses-exchange"]
  },
  categories: {
    farming: ["Emissions"],
  }
};

export default ramses;
