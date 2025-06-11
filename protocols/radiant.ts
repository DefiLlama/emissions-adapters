import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = 1658685600;
const qty = 1000000000;

const yieldFarming = [
  35714286, 16943868, 16077302, 15255054, 14474859, 13734566, 13032134,
  12365627, 20000000, 18923787, 17905485, 16941979, 16030320, 15167718,
  14351533, 13579268, 12848558, 12157169, 11502983, 10884000, 10298325, 9744165,
  9219825, 8723700, 8254272, 7810105, 7389838, 6992186, 6615931, 6259924,
  5923073, 5604349, 5302775, 5017429, 4747438, 4491975, 4250259, 4021550,
  3805147, 3600390, 3406651, 3223336, 3049887, 2885770, 2730485, 2583556,
  2444533, 2312991, 2188527, 2070761, 1959332, 1853899, 1754140, 1659748,
  1570436, 1485930, 1405971, 1330315, 1258730, 1190997,
];

function yieldSchedule() {
  return yieldFarming.map((amount, month) =>
    manualLinear(
      start + month * periodToSeconds.month,
      start + (month + 1) * periodToSeconds.month,
      amount,
    ),
  );
}

const rewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(SUBSTRING(data, 3, 64))))) / 1e18 AS amount
    FROM evm_indexer.logs
    WHERE (
      (topic0 = '0x540798df468d7b23d11f156fdb954cb19ad414d150722a7b6d55ba369dea792e'
        AND address IN ('0xc2054a8c33bfce28de8af4af548c48915c455c13')
        AND topic2 = '0x0000000000000000000000000c4681e6c0235179ec3d4f4fc4df3d14fdd96017')
      OR
      (topic0 = '0xa236f2dcd2b940fd86168787a5f820805cdbd85131f7192d9d9c418556876fca'
        AND address IN (
          '0x76ba3ec5f5adbf1c58c91e86502232317eea72de',
          '0x4fd9f7c5ca0829a656561486bada018505dfcb5e'
        )
      )
    )
    GROUP BY date
    ORDER BY date DESC;
  `, {});

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount),
    });
  }
  return result;
};


const radiant: Protocol = {
  treasury: manualCliff(start, qty * 0.03),
  "dao reserve": manualCliff(start, qty * 0.14),
  "core contributors and advisors": manualLinear(
    start,
    start + periodToSeconds.year * 1.5,
    qty * 0.07,
  ),
  // "pool2 incentives": manualLinear("2022/08/03", "2023/03/17", qty * 0.02),
  // "supply and borrowers incentives": yieldSchedule(),
  team: [
    manualLinear(
      start + periodToSeconds.month * 3,
      start + periodToSeconds.month * 60,
      qty * 0.2 * 0.9,
    ),
    manualCliff(start + periodToSeconds.month * 3, qty * 0.2 * 0.1),
  ],
  "Rewards": rewards,
  meta: {
    token: "arbitrum:0x0c4681e6c0235179ec3d4f4fc4df3d14fdd96017",
    sources: [
      "https://docs.radiant.capital/radiant/project-info/rdnt-tokenomics",
    ],
    protocolIds: ["parent#radiant"],
  },
  categories: {
    noncirculating: ["treasury", "dao reserve"],
    // farming: ["pool2 incentives", "supply and borrowers incentives"],
    farming: ["Rewards"],
    insiders: ["core contributors and advisors", "team"],
  },
};

export default radiant;
