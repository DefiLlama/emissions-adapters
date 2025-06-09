import { CliffAdapterResult, Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds, readableToSeconds } from "../utils/time";
import vesting from "../adapters/uniswap/uniswap";
import { queryCustom } from "../utils/queries";

const qty = 1000000000;
const start = 1638316800;

const rewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`SELECT
    date,
    SUM(amount) AS amount
FROM (
    SELECT
        toStartOfDay(timestamp) AS date,
        SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    WHERE topic0 IN (
        '0x5637d7f962248a7f05a7ab69eec6446e31f3d0a299d997f135a65c62806e7891'
    )
    AND address IN (
        '0x6c1603ab6cecf89dd60c24530dde23f97da3c229',
        '0x4999873bf8741bfffb0ec242aaaa7ef1fe74fce8'
    )
    GROUP BY date

    UNION ALL

    SELECT
        toStartOfDay(timestamp) AS date,
        SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    WHERE topic0 = '0x18ee3c31d4863a37e1b4563022fa292ed3f955a41fe1e49a2e8da1b986430e20'
    AND address = '0xe9c01f928296359ba1d0ad1000cc9bf972cb0026'
    AND topic1 = '0xc98b620c8900494093d98c33a3cd83be00000000000000000000000000000000'
    GROUP BY date
) AS combined
GROUP BY date
ORDER BY date DESC;
`, {})

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount)
    });
  }
  return result;
}

const silo: Protocol = {
  "Genesis protocol-owned liquidity": manualCliff(start, qty * 0.1),
  "Community treasury": manualLinear(
    start,
    start + periodToSeconds.year * 3,
    qty * 0.45,
  ),
  "Early contributors": [
    manualCliff(start + periodToSeconds.month * 6, (qty * 0.0675) / 8),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year * 4,
      (qty * 0.0675 * 7) / 8,
    ),
  ],
  "Founding contributors": [
    manualCliff(start + periodToSeconds.month * 6, (qty * 0.2175) / 6),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year * 3,
      (qty * 0.2175 * 5) / 6,
    ),
  ],
  "Early community rewards": manualCliff("2022-01-01", qty * 0.002),
  "Early investors & early advisors": manualLinear(
    start + periodToSeconds.year * 0.5,
    start + periodToSeconds.year * 2.5,
    qty * 0.063,
  ),
  "Future contributors & future advisors": () =>
    vesting(
      "0x6e5C8274012d9cb386EF8Dcc71a461B71BD07831",
      "ethereum",
      "siloToken",
    ),
    "Incentives": rewards,
  meta: {
    sources: [
      "https://silopedia.silo.finance/governance/token-allocation-and-vesting",
    ],
    notes: [
      `Future contributors and advisors (10%) are distributed to the DAO on a linear unlock, and then individuals have a further vesting schedule depending on when they join the DAO. Only the initial vesting schedule has been described in this analysis.`,
    ],
    token: "ethereum:0x6f80310ca7f2c654691d1383149fa1a57d8ab1f8",
    protocolIds: ["2020"],
  },
  categories: {
    publicSale: ["Genesis protocol-owned liquidity"],
    noncirculating: ["Community treasury"],
    insiders: [
      "Early contributors",
      "Founding contributors",
      "Early investors & early advisors",
      "Future contributors & future advisors",
    ],
    farming: ["Incentives"],
    airdrop: ["Early community rewards"],
  },
};

export default silo;
