import { CliffAdapterResult, Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds, readableToSeconds } from "../utils/time";
import { queryDune } from "../utils/dune";

const stakingRewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const issuanceData = await queryDune("5194885", true)

  for (let i = 0; i < issuanceData.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(issuanceData[i].timestamp),
      amount: issuanceData[i].total_reward_distributed
    });
  }
  return result;
}

const bsc: Protocol = {
  "Staking Rewards": stakingRewards,
  meta: {
    token: "coingecko:binancecoin",
    sources: ["https://docs.bsc.xyz/home/core-concepts/init-token/tokenomics#release-schedule"],
    chain: 'bsc',
    protocolIds: ["6236"],
    notes: [
      "This is used to track the staking rewards of the BSC chain.",
    ]
  },

  categories: {
    staking: ["Staking Rewards"],
  }
};

export default bsc;
