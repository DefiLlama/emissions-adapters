import { manualCliff, manualLinear } from "../adapters/manual";
import { supply } from "../adapters/supply";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const deployTime = 1621292400;
const chain: any = "ethereum";
const CVX: string = "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b";
const TREASURY_ADDRESS = "0x1389388d01708118b497f59521f6943be2541bb7";
const EXCLUDED_TO_ADDRESS = "0x5f465e9fcffc217c5849906216581a657cd60605";

const rewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];

  // 1. Get RewardPaid events from emissions contract, excluding those going to treasury
  const rewardPaidSql = `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) AS amount
    FROM evm_indexer.logs
    WHERE address = {rewardContract:String}
      AND topic0 = {rewardTopic:String}
      AND topic1 != {treasuryTopic:String}
      AND timestamp >= toDateTime({startDate:String})
    GROUP BY date
    ORDER BY date ASC
  `;

  const rewardPaidData = await queryCustom(rewardPaidSql, {
    rewardContract: "0x449f2fd99174e1785cf2a1c79e665fec3dd1ddc6",
    rewardTopic: "0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486",
    treasuryTopic: `0x000000000000000000000000${TREASURY_ADDRESS.substring(2).toLowerCase()}`,
    startDate: "2021-05-17"
  });

  // 2. Get treasury expenses (CVX transfers from treasury, excluding Masterchef (which flows back to treasury)
  const treasuryExpensesSql = `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) AS amount
    FROM evm_indexer.logs
    WHERE address = {cvxToken:String}
      AND topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      AND topic1 = {treasuryFromTopic:String}
      AND topic2 != {excludedToTopic:String}
      AND timestamp >= toDateTime({startDate:String})
    GROUP BY date
    ORDER BY date ASC
  `;

  const treasuryExpensesData = await queryCustom(treasuryExpensesSql, {
    cvxToken: CVX,
    treasuryFromTopic: `0x000000000000000000000000${TREASURY_ADDRESS.substring(2).toLowerCase()}`,
    excludedToTopic: `0x000000000000000000000000${EXCLUDED_TO_ADDRESS.substring(2).toLowerCase()}`,
    startDate: "2021-05-17"
  });

  const combinedData = new Map<string, number>();

  // Add reward paid amounts
  for (const item of rewardPaidData) {
    const dateKey = item.date;
    const amount = Number(item.amount) / 1e18;
    combinedData.set(dateKey, (combinedData.get(dateKey) || 0) + amount);
  }

  // Add treasury expenses
  for (const item of treasuryExpensesData) {
    const dateKey = item.date;
    const amount = Number(item.amount) / 1e18;
    combinedData.set(dateKey, (combinedData.get(dateKey) || 0) + amount);
  }

  for (const [date, amount] of combinedData.entries()) {
    result.push({
      type: "cliff",
      start: readableToSeconds(date),
      amount: amount,
    });
  }

  result.sort((a, b) => a.start - b.start);

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
