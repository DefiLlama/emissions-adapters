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
  backfill: boolean = false
): Promise<number> {
  if (backfill) return timestampDeployed
  if (!res) {
    let r;
    try {
      r = await fetch(`https://api.llama.fi/emission/${adapter}`).then((r) =>
        r.json(),
      );
    } catch {
      return timestampDeployed;
    }
    if (!r.body) return timestampDeployed;
    r = JSON.parse(r.body);
    return r.metadata.incompleteSections == null ||
      r.metadata.incompleteSections[0].lastRecord == null
      ? timestampDeployed
      : r.metadata.incompleteSections[0].lastRecord;
  }
  return res;
}

async function getStoredEmissions(adapter: string, sectionKey: string): Promise<CliffAdapterResult[]> {
  try {
    const r = await fetch(`https://api.llama.fi/emission/${adapter}`).then((r) => r.json());
    if (!r.body) return [];
    const data = JSON.parse(r.body);
    const section = data.documentedData?.data?.find((s: any) => s.label === sectionKey);
    if (!section?.data) return [];

    return section.data.map((d: any) => ({
      type: "cliff" as const,
      start: d.timestamp,
      amount: d.rawEmission || d.unlocked || 0
    }));
  } catch {
    return [];
  }
}

export async function balance(
  owners: string[],
  target: string,
  chain: any,
  adapter: string,
  timestampDeployed: number,
  backfill: boolean = false,
  sectionKey?: string
): Promise<CliffAdapterResult[]> {
  let trackedTimestamp: number;
  let decimals: number;

  [trackedTimestamp, decimals] = await Promise.all([
    latest(adapter, timestampDeployed, backfill),
    target == GAS_TOKEN
      ? 18
      : call({
          target,
          abi: "erc20:decimals",
          chain,
        }),
  ]);

  try {
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
                  if (!chainData[block].result) chainData[block].result = 0;
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
  } catch {
    if (sectionKey) {
      return await getStoredEmissions(adapter, sectionKey);
    }
    return [];
  }
}
