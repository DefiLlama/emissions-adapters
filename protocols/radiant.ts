import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1658685600;
const qty = 1_000_000_000;

const yieldFarming = [
35714286,
16943868,
16077302,
15255054,
14474859,
13734566,
13032134,
12365627,
20000000,
18923787,
17905485,
16941979,
16030320,
15167718,
14351533,
13579268,
12848558,
12157169,
11502983,
10884000,
10298325,
9744165,
9219825,
8723700,
8254272,
7810105,
7389838,
6992186,
6615931,
6259924,
5923073,
5604349,
5302775,
5017429,
4747438,
4491975,
4250259,
4021550,
3805147,
3600390,
3406651,
3223336,
3049887,
2885770,
2730485,
2583556,
2444533,
2312991,
2188527,
2070761,
1959332,
1853899,
1754140,
1659748,
1570436,
1485930,
1405971,
1330315,
1258730,
1190997,
]

function yieldSchedule() {
  return yieldFarming.map((amount, month) =>
    manualLinear(
      start + month * periodToSeconds.month,
      start + (month + 1) * periodToSeconds.month,
      amount
    ),
  );
}

const radiant: Protocol = {
  treasury: manualCliff(start, qty * 0.03),
  "dao reserve": manualCliff(start, qty * 0.14),
  "core contributors and advisors": manualLinear(
    start,
    start + periodToSeconds.year*1.5,
    qty * 0.07,
  ),
  "pool2 incentives": manualLinear(
    "2022/08/03",
    "2023/03/17",
    qty*0.02,
  ),
  "supply and borrowers incentives": yieldSchedule(),
  team: [
    manualLinear(
      start + periodToSeconds.month * 3,
      start + periodToSeconds.month * 60,
      qty * 0.2 * 0.9,
    ),
    manualCliff(start + periodToSeconds.month * 3, qty * 0.2 * 0.1),
  ],

  token: "arbitrum:0x0c4681e6c0235179ec3d4f4fc4df3d14fdd96017",
  sources: ["https://docs.radiant.capital/radiant/project-info/rdnt-tokenomics"],
  protocolIds: ["1922"],
};

export default radiant;