import { manualLinear } from "../adapters/manual";
import { Protocol, LinearAdapterResult, CliffAdapterResult } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const rates = {
  "03/07/2021": 30,
  "03/08/2021": 20,
  "03/09/2021": 17,
  "03/10/2021": 13.5,
  "03/11/2021": 10,
  "03/12/2021": 9.5,
  "03/01/2022": 9,
  "03/02/2022": 8.5,
  "03/03/2022": 8,
  "03/04/2022": 7.5,
  "03/05/2022": 7,
  "03/06/2022": 6.5,
  "03/07/2022": 6,
  "03/08/2022": 5.5,
  "03/09/2022": 5,
  "03/10/2022": 4.5,
  "03/11/2022": 4,
  "03/12/2022": 3.5,
  "03/01/2023": 3,
  "03/02/2023": 2.5,
  "03/03/2023": 2,
  "03/04/2023": 1.5,
  "03/05/2023": 1.25,
  "03/06/2023": 1,
  "03/07/2023": 0.9,
  "03/08/2023": 0.8,
  "03/09/2023": 0.7,
  "03/10/2023": 0.6,
  "03/11/2023": 0.5,
  "03/12/2023": 0.4,
  "03/01/2024": 0.3,
  "03/02/2024": 0,
};
function schedule(
  portion: number,
  cliffMonths: number = 0,
): LinearAdapterResult[] {
  let sections: LinearAdapterResult[] = [];
  const dates = Object.keys(rates);
  let amount: number = 0;

  for (let i = 0; i < dates.length - 1; i++) {
    amount += (Object.values(rates)[i] * periodToSeconds.month * portion) / 100;

    if (i < cliffMonths) {
      continue;
    } else {
      sections.push(manualLinear(dates[i], dates[i + 1], amount, "DD/MM/YYYY"));
      amount = 0;
    }
  }

  return sections;
}

const rewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
where topic0 = '0x71bab65ced2e5750775a0613be067df48ef06cf92a496ebf7663ae0660924954'
and address in (
'0xd6a4f121ca35509af06a0be99093d08462f53052',
'0x188bed1968b795d5c9022f6a0bb5931ac4c18f00',
'0x4483f0b6e2f5486d06958c20f8c39a7abe87bf8f'
)
GROUP BY date
ORDER BY date DESC`, {})

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount)
    });
  }
  return result;
}

const traderJoe: Protocol = {
  "Liquidity providers": schedule(50),
  "Potential strategic investors": schedule(10, 3),
  Team: schedule(20, 3),
  Treasury: schedule(20),
  Incentives: rewards,
  meta: {
    sources: [
      "https://help.traderjoexyz.com/en/trader-joe/platform/tokenomics",
    ],
    token: "avax:0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd",
    protocolIds: ["parent#trader-joe"],
  },
  categories: {
    // farming: ["Liquidity providers"],
    farming: ["Incentives"],
    noncirculating: ["Treasury"],
    privateSale: ["Potential strategic investors"],
    insiders: ["Team"],
  },
};
export default traderJoe;
