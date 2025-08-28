import fetch from "node-fetch";
import { CliffAdapterResult } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

export default async function morpho(): Promise<CliffAdapterResult[]> {
  const data = await queryCustom(`
SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE topic0 = '0xf7a40077ff7a04c7e61f6f26fb13774259ddf1b6bce9ecf26a8276cdd3992683'
AND address IN (
    '0x330eefa8a787552dc5cad3c3ca644844b1e61ddb',
    '0x5400dbb270c956e8985184335a1c62aca6ce1333',
    '0x678ddc1d07eaa166521325394cdeb1e4c086df43',
    '0x3ef3d8ba38ebe18db133cec108f4d14ce00dd9ae'
)
WHERE topic2 IN (
    '0x00000000000000000000000058d97b57bb95320f9a05dc918aef65434969c2b2',
    '0x0000000000000000000000009d03bb2092270648d7480049d0e58d2fcf0e5123',
    '0x0000000000000000000000009994e35db50125e0df82e4c2dde62496ce330999',
    '0x000000000000000000000000baa5cc21fd487b8fcc2f632f3f4e8d37262a0842',
    '0x00000000000000000000000040bd670a58238e6e230c430bbb5ce6ec0d40df48',
)
GROUP BY date
ORDER BY date DESC;
    `, {});
  
    const result: CliffAdapterResult[] = [];
    for (let i = 0; i < data.length; i++) {
      result.push({
        type: "cliff",
        start: readableToSeconds(data[i].date),
        amount: Number(data[i].amount),
        isUnlock: false,
      });
    }
    return result;
}