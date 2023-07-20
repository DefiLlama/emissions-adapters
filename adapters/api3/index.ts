import fetch from "node-fetch";
import { call, multiCall } from "@defillama/sdk/build/abi/abi2";
import { CliffAdapterResult, TimeSeriesChainData } from "../../types/adapters";
import { abi } from "./abi";
import { getTimestamp } from "@defillama/sdk/build/util/index";
import { periodToSeconds } from "../../utils/time";
import { PromisePool } from "@supercharge/promise-pool";
import { filterRawAmounts, findBlockHeightArray } from "../../utils/chainCalls";

type RewardsRes = {
  atBlock: string;
  amount: string;
};
const target: string = "0x6dd655f10d4b9E242aE186D9050B68F725c76d76";
const token: string = "0x0b38210ea11411557c13457D4dA7dC6ea731B88a";
const chain: any = "ethereum";
let res: number;

export async function latest(): Promise<number> {
  return 2688 * periodToSeconds.week
  if (!res)
    return fetch(`https://api.llama.fi/emission/api3`)
      .then((r) => r.json())
      .then((r) => JSON.parse(r.body))
      .then((r) =>
        r.metadata.incompleteSections == null ||
        r.metadata.incompleteSections[0].lastRecord == null
          ? 2688 * periodToSeconds.week // origin epoch * length
          : r.metadata.incompleteSections[0].lastRecord,
      );
  return res;
}

export async function stakingRewards(): Promise<CliffAdapterResult[]> {
  let trackedEpochTimestamp: number;
  let latestEpoch: number;
  let decimals: number;

  [trackedEpochTimestamp, latestEpoch, decimals] = await Promise.all([
    latest(),
    call({
      target,
      abi: abi.epochIndexOfLastReward,
      chain,
    }),
    call({
      target: token,
      abi: "erc20:decimals",
      chain,
    }),
  ]);

  const trackedEpoch: number = Math.floor(
    trackedEpochTimestamp / periodToSeconds.week,
  );
  const allEpochs: number[] = [];
  for (let i = trackedEpoch; i <= latestEpoch; i++) {
    allEpochs.push(i);
  }

  const chainData: TimeSeriesChainData = {};

  const amounts = (
    await multiCall({
      calls: allEpochs.map((n: number) => ({
        target,
        params: n,
      })),
      abi: abi.epochIndexToReward,
      chain,
    })
  ).filter((r: any) => r.amount != 0);

  await Promise.all(
    amounts.map((r: any) =>
      getTimestamp(Number(r.atBlock), chain).then((timestamp: number) => {
        chainData[r.atBlock] = { timestamp, result: r.amount };
      }),
    ),
  );

  const sections: CliffAdapterResult[] = [];
  Object.values(chainData).map((v: any) => {
    const amount: number = v.result / 10 ** decimals;
    sections.push({ type: "cliff", start: v.timestamp, amount });
  });

  return sections;
}
