import { getLogs, lookupBlock } from "@defillama/sdk/build/util";
import { multiCall } from "@defillama/sdk/build/abi/abi2";
import abi from "./abi";
import { LinearAdapterResult } from "../../types/adapters";

const FACTORY_ADDRESS = "0x3b05a5295Aa749D78858E33ECe3b97bB3Ef4F029";
const FLUID_TOKEN = "0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb";

export default async function adapter(): Promise<LinearAdapterResult[]> {
  const logs = await getLogs({
    target: FACTORY_ADDRESS,
    topic: "0x4ac20a376998e094ddc7f2886aacc04793f0967d837b03bcfea523a8f27f2485",
    topics: [],
    fromBlock: 12602043,
    toBlock: 12782627,
    keys: [],
    chain: "ethereum",
  });
  

  const vestingContracts: { vesting: string; amount: number }[] = [];
  logs.output.map((log: any) => {
    if (log.topics[0] !== "0x4ac20a376998e094ddc7f2886aacc04793f0967d837b03bcfea523a8f27f2485") {
      return;
    }
    vestingContracts.push({
      vesting: `0x${log.topics[2].substring(26)}`,
      amount: log.data / 1e18
    });
  });

  const [beginTimes, cliffTimes, endTimes, amounts] = await Promise.all([
    multiCall({
      calls: vestingContracts.map(v => ({
        target: v.vesting
      })),
      abi: abi.vestingContractAbi.vestingBegin,
      chain: "ethereum"
    }),
    multiCall({
      calls: vestingContracts.map(v => ({
        target: v.vesting
      })),
      abi: abi.vestingContractAbi.vestingCliff,
      chain: "ethereum"
    }),
    multiCall({
      calls: vestingContracts.map(v => ({
        target: v.vesting
      })),
      abi: abi.vestingContractAbi.vestingEnd,
      chain: "ethereum"
    }),
    multiCall({
      calls: vestingContracts.map(v => ({
        target: v.vesting
      })),
      abi: abi.vestingContractAbi.vestingAmount,
      chain: "ethereum"
    })
  ]);

  return vestingContracts.map((_, i) => ({
    type: "linear" as const,
    token: FLUID_TOKEN,
    start: Number(beginTimes[i]),
    end: Number(endTimes[i]),
    cliff: Number(cliffTimes[i]),
    amount: Number(amounts[i]) / 1e18
  }));
}
