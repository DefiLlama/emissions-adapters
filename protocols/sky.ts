import { getBlock } from "@defillama/sdk/build/computeTVL/blocks";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { unixTimestampNow } from "../utils/time";
import { PromisePool } from "@supercharge/promise-pool";
import { ChainApi } from "@defillama/sdk";
import { queryDune } from "../utils/dune";


// const incentivesRewards = async (): Promise<CliffAdapterResult[]> => {
//   const result: CliffAdapterResult[] = [];
  
//   const api = new ChainApi({
//         chain: 'ethereum'
//   })

//   let rewards = await api.getLogs({
//     target: "0x0650CAF159C5A49f711e8169D4336ECB9b950275",
//     eventAbi: "event RewardPaid(address indexed user, uint256 reward)",
//     fromBlock: 22566720,
//     toBlock: 22567470,//(await getBlock("ethereum", unixTimestampNow())).number,
//     chain: "ethereum",
//     entireLog: true,
//     parseLog: true,
//   })

//   const rewardData: any[] = []

//   rewards.forEach((reward) => {
//       rewardData.push({
//         amount: reward.parsedLog.amount,
//         block: reward.blockNumber,
//       })
//   })

//   const blockNumbers = [...new Set(rewardData.map((data) => data.block))];
//   console.log(`Processing ${blockNumbers.length} blocks for Sky Incentives rewards...`);
//   await PromisePool.withConcurrency(10)
//     .for(blockNumbers)
//       .process(async (blockNumber) => {
//         const block = await api.provider.getBlock("ethereum", blockNumber);
//         if (!block) return;
//         const timestamp = block.timestamp;
//         const rewardsInBlock = rewardData.filter(data => data.block === blockNumber);
//         console.log(`Processing block ${blockNumber} at timestamp ${timestamp} with ${rewardsInBlock.length} rewards`);
//         for (const reward of rewardsInBlock) {
//           result.push({
//             type: "cliff",
//             amount: reward.amount / 1e18,
//             start: timestamp,
//           });
//         }
//       });

//   return result;
// }

const incentivesRewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const issuanceData = await queryDune("5190295", true)

  for (let i = 0; i < issuanceData.length; i++) {
    result.push({
      type: "cliff",
      start: issuanceData[i].timestamp,
      amount: issuanceData[i]._col1 / 1e18
    });
  }
  return result;
}

const sky: Protocol = {
  "Sky Incentives": incentivesRewards,
  meta: {
    sources: [
      "https://etherscan.io/address/0x0650CAF159C5A49f711e8169D4336ECB9b950275#code",
    ],
    token: "ethereum:0x56072C95FAA701256059aa122697B133aDEd9279",
    protocolIds: ["parent#maker"],
    notes: ["This page only tracks the Sky Incentives rewards."],
  },
  categories: {
    farming: ["Sky Incentives"],
  },
};
export default sky;
