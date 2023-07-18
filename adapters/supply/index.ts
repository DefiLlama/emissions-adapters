import fetch from "node-fetch";
import { call } from "@defillama/sdk/build/abi/abi2";
import { CliffAdapterResult } from "../../types/adapters";
import { findBlockHeightArray } from "../../utils/chainCalls";
import { PromisePool } from "@supercharge/promise-pool";

let res: number;

export async function latest(key: string, reference: number): Promise<number> {
  return reference
  if (!res) {
    let r = await fetch(`https://api.llama.fi/emission/${key}`).then((r) =>
      r.json(),
    );
    if (!r.body) return reference;
    r = JSON.parse(r.body);
    return r.metadata.incompleteSections == null ||
      r.metadata.incompleteSections[0].lastRecord == null
      ? reference
      : r.metadata.incompleteSections[0].lastRecord;
  }
  return res;
}

export async function supply(
  chain: any,
  target: string,
  timestampDeployed: number,
  adapter: string,
  excluded: number = 0,
) {
  let trackedTimestamp: number;
  let decimals: number;

  [trackedTimestamp, decimals] = await Promise.all([
    latest(adapter, timestampDeployed),
    call({
      target,
      abi: "erc20:decimals",
      chain,
    }),
  ]);

  const chainData = await findBlockHeightArray(trackedTimestamp, chain);

  await PromisePool.withConcurrency(10)
    .for(Object.keys(chainData))
    .process(
      async (block) =>
        await call({
          target,
          chain,
          abi: "erc20:totalSupply",
          block,
        }).then((res: number) => {
          chainData[block].result = res / 10 ** decimals - excluded;
        }),
    );

  const sections: CliffAdapterResult[] = [];
  let supplyIndex: number = 0;
  const supplies = Object.values(chainData);

  for (let i = 0; i < supplies.length; i++) {
    const thisSupply: number = supplies[i].result;
    if (supplyIndex == 0 && thisSupply == 0) continue;
    supplyIndex += 1;

    const amount = thisSupply - supplies[i - 1].result;
    if (amount <= 0) continue;

    const start = supplies[i].timestamp;
    sections.push({ type: "cliff", start, amount });
  }

  return sections;
}
