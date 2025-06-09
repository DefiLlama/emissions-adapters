import { manualCliff, manualLinear } from "../adapters/manual";
import { supply, latest } from "../adapters/supply";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryAggregatedDailyLogsAmounts } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const deployTime = 1621292400;
const chain: any = "ethereum";
const CVX: string = "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b";

const rewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryAggregatedDailyLogsAmounts({
    address: "0xcf50b810e57ac33b91dcf525c6ddd9881b139332",
    topic0: "0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486",
    startDate: "2021-05-17",
  })

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount) / 1e18,
    });
  }
  return result;
}

const convex: Protocol = {
  Investors: manualLinear(
    deployTime,
    deployTime + periodToSeconds.year,
    3300000,
  ),
  Treasury: manualLinear(
    deployTime,
    deployTime + periodToSeconds.year,
    9700000,
  ),
  Team: manualLinear(deployTime, deployTime + periodToSeconds.year, 10000000),
  "veCRV voters": manualCliff(deployTime, 1000000),
  "veCRV holders": manualCliff(deployTime, 1000000),
  "Liquidity mining": manualLinear(
    deployTime,
    deployTime + 4 * periodToSeconds.year,
    25000000,
  ),
  "Curve LP rewards": () =>
    supply(chain, CVX, deployTime, "convex-finance", 50000000),
  "Incentives": rewards,
  meta: {
    sources: [
      "https://docs.convexfinance.com/convexfinance/general-information/tokenomics",
    ],
    token: `${chain}:${CVX}`,
    protocolIds: ["319"],
    incompleteSections: [
      {
        key: "Curve LP rewards",
        allocation: 50000000,
        lastRecord: () => 1621292400,
      },
    ],
  },
  categories: {
    noncirculating: ["Treasury"],
    airdrop: ["veCRV voters","veCRV holders"],
    // farming: ["Liquidity mining","Curve LP rewards"],
    farming: ["Incentives"],
    privateSale: ["Investors"],
    insiders: ["Team"],
  },
};
export default convex;
