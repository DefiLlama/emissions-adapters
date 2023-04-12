import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol, LinearAdapterResult } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start: number = 1625266800;
const qty: number = 500000000;

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
    amount += Object.values(rates)[i] * periodToSeconds.month * portion / 100;

    if (i < cliffMonths) {
      continue;
    } else {
      sections.push(manualLinear(dates[i], dates[i + 1], amount, "DD/MM/YYYY"));
      amount = 0;
    }
  }

  return sections;
}

const traderJoe: Protocol = {
  "Liquidity providers": schedule(50),
  "Potential strategic investors": schedule(10, 3),
  Team: schedule(20, 3),
  Treasury: schedule(20),
  sources: ["https://help.traderjoexyz.com/en/trader-joe/platform/tokenomics"],
  token: "avax:0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd",
  protocolIds: ["468"],
};
export default traderJoe;
