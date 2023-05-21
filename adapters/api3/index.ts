import fetch from "node-fetch";
import { call, multiCall } from "@defillama/sdk/build/abi/abi2";
import { CliffAdapterResult } from "../../types/adapters";
import { abi } from "./abi";
import { getTimestamp } from "@defillama/sdk/build/util/index";
import { periodToSeconds } from "../../utils/time";

type RewardsRes = {
  atBlock: string;
  amount: string;
};
type BlockTime = {
  block: number;
  timestamp: number;
};

const target: string = "0x6dd655f10d4b9E242aE186D9050B68F725c76d76";
const token: string = "0x0b38210ea11411557c13457D4dA7dC6ea731B88a";
const chain: any = "ethereum";
let res: number;

export async function latest(): Promise<number> {
  if (!res)
    return fetch(`https://api.llama.fi/emission/api3`)
      .then((r) => r.json())
      .then((r) => JSON.parse(r.body))
      .then((r) =>
        r.metadata.custom == null || r.metadata.custom.lastRecord == null
          ? 2688 * periodToSeconds.week // origin epoch * length
          : r.metadata.custom.lastRecord,
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

  const rewards: RewardsRes[] = (
    await multiCall({
      calls: allEpochs.map((n: number) => ({
        target,
        params: n,
      })),
      abi: abi.epochIndexToReward,
      chain,
    })
  ).filter((r: any) => r.amount != 0);

  const blockHeights: number[] = rewards.map((r: any) => Number(r.atBlock));
  const blockTimes: BlockTime[] = await Promise.all(
    blockHeights.map((h: number) =>
      getTimestamp(h, chain).then((r: number) => ({ block: h, timestamp: r })),
    ),
  );

  const sections: CliffAdapterResult[] = [];
  blockTimes.map((t: BlockTime, i: number) => {
    if (Number(rewards[i].atBlock) != t.block)
      throw new Error(`block mismatch in API3 staking rewards adapter`);
    const amount: number = Number(rewards[i].amount) / 10 ** decimals;
    sections.push({ type: "cliff", start: t.timestamp, amount });
  });
  return sections;
}
