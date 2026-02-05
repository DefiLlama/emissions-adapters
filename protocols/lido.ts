import { balance, latest } from "../adapters/balance";
import { manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const qty: number = 1e9;
const token: string = "0x5a98fcbea516cf06857215779fd812ca3bef1b32";
const timestampDeployed: number = 1609804800;
const chain: string = "ethereum";

const schedule = (proportion: number) =>
  manualLinear("2021-12-17", "2022-12-17", qty * proportion);
const rewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`WITH
source_wallets AS (
    SELECT arrayJoin([
        -- Ethereum
        '0x3e40d73eb977dc6a537af587d48316fee66e9c8c', 
        '0x87d93d9b2c672bf9c9642d853a8682546a5012b5',
        '0x753d5167c31fbeb5b49624314d74a957eb271709', 
        '0x55c8de1ac17c1a937293416c9bce5789cbbf61d1',
        '0x12a43b049a7d330cb8aeab5113032d18ae9a9030', 
        '0x17f6b2c738a63a8d3a113a228cfd0b373244633d',
        '0xde06d17db9295fa8c4082d4f73ff81592a3ac437', 
        '0x834560f580764bc2e0b16925f8bf229bb00cb759',
        '0x13c6ef8d45afbccf15ec0701567cc9fad2b63ce8',
        -- Optimism
        '0x5033823f27c5f977707b58f0351adcd732c955dd',
        -- Arbitrum
        '0x8c2b8595ea1b627427efe4f29a64b145df439d16'
    ]) AS address
),
exclusion_list AS (
    SELECT arrayJoin([
        -- All source wallets are also excluded as recipients
        '0x3e40d73eb977dc6a537af587d48316fee66e9c8c', 
        '0x87d93d9b2c672bf9c9642d853a8682546a5012b5',
        '0x753d5167c31fbeb5b49624314d74a957eb271709', 
        '0x55c8de1ac17c1a937293416c9bce5789cbbf61d1',
        '0x12a43b049a7d330cb8aeab5113032d18ae9a9030', 
        '0x17f6b2c738a63a8d3a113a228cfd0b373244633d',
        '0xde06d17db9295fa8c4082d4f73ff81592a3ac437', 
        '0x834560f580764bc2e0b16925f8bf229bb00cb759',
        '0x13c6ef8d45afbccf15ec0701567cc9fad2b63ce8', 
        '0x5033823f27c5f977707b58f0351adcd732c955dd',
        '0x8c2b8595ea1b627427efe4f29a64b145df439d16',
        -- Bridge contracts
        '0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf', 
        '0xa3a7b6f88361f48403514059f1f16c8e78d60eec',
        '0x99c9fc46f92e8a1c0dec1b1747d010903e884be1'
    ]) AS address
)
SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE short_topic0 = '0xddf252ad'
WHERE
    topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    AND lower(concat('0x', substring(topic1, 27))) IN (SELECT address FROM source_wallets)
    AND lower(concat('0x', substring(topic2, 27))) NOT IN (SELECT address FROM exclusion_list)
    AND topic2 != '0x0000000000000000000000000000000000000000000000000000000000000000'
    AND (
        (chain = '1' AND address = '0x5a98fcbea516cf06857215779fd812ca3bef1b32') OR
        (chain = '10' AND address = '0xfdb794692724153d1488ccdbe0c56c252596735f') OR
        (chain = '42161' AND address = '0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60')
    )
GROUP BY date
ORDER BY date DESC`, {})

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount),
      isUnlock: false
    });
  }
  return result;
}

const lido: Protocol = {
  Investors: schedule(0.2218),
  "Validators & Signature Holders": schedule(0.065),
  "Initial Lido Developers": schedule(0.2),
  "Founders & Future Employees": schedule(0.15),
  // "DAO Treasury": (backfill: boolean) =>
  //   balance(
  //     ["0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
  //     token,
  //     chain,
  //     "lido#",
  //     timestampDeployed,
  //     backfill,
  //   ),
  "Incentives": rewards,
  meta: {
    notes: ["We are tracking LDO token distribution from known walllets as incentives"],
    sources: [`https://blog.lido.fi/introducing-ldo/`],
    token: `${chain}:${token}`,
    protocolIds: ["182"],
    // total: qty,
  
    // incompleteSections: [
    //   {
    //     key: "DAO Treasury",
    //     allocation: qty * 0.3632,
    //     lastRecord: (backfill: boolean) =>
    //       latest("lido#", timestampDeployed, backfill),
    //   },
    // ],
  },
  categories: {
    // noncirculating: ["DAO Treasury"],
    farming: ["Incentives"],
    privateSale: ["Investors"],
    insiders: [
      "Validators & Signature Holders",
      "Initial Lido Developers",
      "Founders & Future Employees",
    ],
  },
};
export default lido;
