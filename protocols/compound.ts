import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryDune } from "../utils/dune";
import { periodToSeconds } from "../utils/time";

const start = 1592222400;
const qty = 10000000;

const compRewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const issuanceData = await queryDune("5194691", true)

  for (let i = 0; i < issuanceData.length; i++) {
    result.push({
      type: "cliff",
      start: issuanceData[i].timestamp,
      amount: issuanceData[i].amount
    });
  }
  return result;
}

const compound: Protocol = {
  "Liquidity mining": [
    // manualLinear("2020-05-27", "2020-06-26", 31 * 3297),
    // manualLinear("2020-06-27", "2020-08-30", 65 * 2880),
    // manualLinear("2020-06-27", "2025-08-24", 1819 * 2304),
    compRewards,
  ],
  "Team founders": manualLinear(
    start,
    start + periodToSeconds.year * 4,
    qty * 0.225,
  ),
  ShareHolders: manualCliff(start, qty * 0.24),
  "Coinbase Earn": manualLinear("2020-06-01", "2020-11-30", qty * 0.05),
  // "Future team": manualCliff(start, qty * 0.037),
  meta: {
    notes: [
      `No information about future team vesting schedule, so it's been excluded from this analysis`,
    ],
    token: "ethereum:0xc00e94cb662c3520282e6f5717214004a7f26888",
    sources: [
      "https://medium.com/compound-finance/compound-governance-decentralized-b18659f811e0",
    ],
    protocolIds: ["114"],
  },
  categories: {
    farming: ["Liquidity mining"],
    insiders: ["Team founders"],
  },
};

export default compound;
