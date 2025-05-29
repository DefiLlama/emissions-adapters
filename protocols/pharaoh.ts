import { manualCliff } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = readableToSeconds("2023-12-08"); 
const total = 50_000;

const emissions = async (): Promise<LinearAdapterResult[]> => {
  const result: LinearAdapterResult[] = [];
  const data = await queryCustom(`SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
WHERE topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  AND topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000'
  AND address = '0xaaab9d12a30504559b0c5a9a5977fee4a6081c6b'
  AND transaction_hash IN (
      SELECT transaction_hash 
      FROM evm_indexer.logs
      WHERE topic0 = '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f'
        AND address = '0xaaa823aa799bda3193d46476539bcb1da5b71330'
  )
GROUP BY date
ORDER BY date DESC`, {});

data.sort((a, b) => readableToSeconds(a.date) - readableToSeconds(b.date));

for (let i = 0; i < data.length; i++) {
  const currentTimestamp = readableToSeconds(data[i].date);
  const nextTimestamp = i < data.length - 1 
    ? readableToSeconds(data[i + 1].date)
    : currentTimestamp + 86400;

  result.push({
    type: "linear",
    start: currentTimestamp,
    end: nextTimestamp,
    amount: Number(data[i].amount),
  });
  }
  return result;
}

const pharaoh: Protocol = {
  "Airdrop": manualCliff(start, total * 0.2), 
  "Reserves": manualCliff(start, total * 0.2),
  "ve Grants": manualCliff(start, total * 0.2),
  "Contributors": manualCliff(start, total * 0.2),
  "LGE": manualCliff(start, total * 0.1),
  "POL": manualCliff(start, total * 0.1),
  "Emissions": emissions,

  meta: {
    notes: [
    ],
    token: `avax:0xAAAB9D12A30504559b0C5a9A5977fEE4A6081c6b`,
    sources: [
      "https://docs.pharaoh.exchange/pages/tokenomics-and-emissions"
    ],
    protocolIds: ["parent#pharaoh-exchange", "4287", "3921"]
  },
  categories: {
    insiders: ["Contributors"],
    airdrop: ["Airdrop"],
    noncirculating: ["Reserves"],
    farming: ["LGE", "Emissions"],
    liquidity: ["POL"]
  }
};

export default pharaoh;
