import { multiCall, call } from "@defillama/sdk/build/abi/abi2";
import fetch from "node-fetch";
import { CliffAdapterResult } from "../../types/adapters";
import { PromisePool } from "@supercharge/promise-pool";
import { filterRawAmounts, findBlockHeightArray } from "../../utils/chainCalls";
import { GAS_TOKEN } from "../../utils/constants";
import { getBalance } from "@defillama/sdk/build/eth";

let res: number;

export async function latest(
  adapter: string,
  timestampDeployed: number,
): Promise<number> {
  if (!res) {
    let r = await fetch(`https://api.llama.fi/emission/${adapter}`).then((r) =>
      r.json(),
    );
    if (!r.body) return timestampDeployed;
    r = JSON.parse(r.body);
    return r.metadata.incompleteSections == null ||
      r.metadata.incompleteSections[0].lastRecord == null
      ? timestampDeployed
      : r.metadata.incompleteSections[0].lastRecord;
  }
  return res;
}

export async function balance(
  owners: string[],
  target: string,
  chain: any,
  adapter: string,
  timestampDeployed: number,
): Promise<CliffAdapterResult[]> {
  let trackedTimestamp: number;
  let decimals: number;

  [trackedTimestamp, decimals] = await Promise.all([
    latest(adapter, timestampDeployed),
    target == GAS_TOKEN
      ? 18
      : call({
          target,
          abi: "erc20:decimals",
          chain,
        }),
  ]);

  const chainData = await findBlockHeightArray(trackedTimestamp, chain);

  await PromisePool.withConcurrency(10)
    .for(Object.keys(chainData))
    .process(async (block) =>
      target == GAS_TOKEN
        ? await PromisePool.withConcurrency(10)
            .for(owners)
            .process(async (target) => {
              getBalance({
                target,
                block: Number(block),
                chain,
              }).then((r: any) => {
                if (!r.output)
                  throw new Error(`balance call failed for ${adapter}`);
                chainData[block].result += Number(r.output);
              });
            })
        : await multiCall({
            calls: owners.map((o: string) => ({ target, params: [o] })),
            abi: "erc20:balanceOf",
            chain,
            block,
            requery: true,
          }).then((r: (number | null)[]) => {
            if (r.includes(null))
              throw new Error(`balance call failed for ${adapter}`);
            chainData[block].result = r.reduce(
              (p: number, c: any) => Number(p) + Number(c),
              0,
            );
          }),
    );

  return filterRawAmounts(chainData, decimals);
}
