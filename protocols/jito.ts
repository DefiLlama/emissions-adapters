import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryDune } from "../utils/dune";
import { periodToSeconds } from "../utils/time";

const start = 1701907200;
const total = 1e9;

const jitoDAO = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const issuanceData = await queryDune("5188599", true)

  for (let i = 0; i < issuanceData.length; i++) {
    result.push({
      type: "cliff",
      start: new Date(issuanceData[i].date).getTime() / 1000,
      amount: issuanceData[i].daily_jito_outflow / 1e9
    });
  }
  return result;
}

const jito: Protocol = {
  Investors: [
    manualCliff(start + periodToSeconds.year, (total * 0.162) / 3),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(2),
      (total * 0.162 * 2) / 3,
    ),
  ],
  "Core Contributors": [
    manualCliff(start + periodToSeconds.year, (total * 0.245) / 3),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(2),
      (total * 0.245 * 2) / 3,
    ),
  ],
  "Ecosystem Development": manualLinear(
    start,
    start + periodToSeconds.years(6),
    total * 0.25,
  ),
  Airdrop: [
    manualCliff(start, total * 0.09),
    manualLinear(start, start + periodToSeconds.year, total * 0.01),
  ],
  "Community Growth": jitoDAO,
  meta: {
    token: `coingecko:jito-governance-token`,
    sources: [
      "https://www.jito.network/blog/announcing-jto-the-jito-governance-token/",
    ],
    notes: [
      `From the chart given in the source material, Jito estimate ~6 year linear vesting schedule for Community Growth and Ecosystem Development sections. Therefore we have used the same in this analysis, For the Community Growth section, we have used the Jito DAO token outflow data to estimate the vesting schedule.`,
    ],
    protocolIds: ["parent#jito"],
  },
  categories: {
    noncirculating: ["Ecosystem Development"],
    airdrop: ["Airdrop"],
    farming: ["Community Growth"],
    privateSale: ["Investors"],
    insiders: ["Core Contributors"],
  },
};

export default jito;
