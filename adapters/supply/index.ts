import fetch from "node-fetch";
import { call } from "@defillama/sdk/build/abi/abi2";
import { CliffAdapterResult } from "../../types/adapters";
import { findBlockHeightArray } from "../../utils/chainCalls";
import { PromisePool } from "@supercharge/promise-pool";

let res: number | undefined;

export async function latest(
    key: string,
    reference: number,
    backfill: boolean = false,
): Promise<number> {
  if (res === undefined) {
    let r;
    try {
      r = await fetch(`https://api.llama.fi/emission/${key}`).then((r) =>
          r.json(),
      );
    } catch {
      res = reference;
      return reference;
    }
    if (!r.body) {
      res = reference;
      return reference;
    }
    r = JSON.parse(r.body);
    const result = backfill ||
    r.metadata.incompleteSections == null ||
    r.metadata.incompleteSections[0].lastRecord == null
        ? reference
        : r.metadata.incompleteSections[0].lastRecord;

    res = result;
    return result;
  }
  return res;
}

export async function supply(
    chain: any,
    target: string,
    timestampDeployed: number,
    adapter: string,
    excluded: number = 0,
    backfill: boolean = false,
) {
  let trackedTimestamp: number;
  let decimals: number;

  [trackedTimestamp, decimals] = await Promise.all([
    latest(adapter, timestampDeployed, backfill),
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

    try {
      const amount = thisSupply - supplies[i - 1].result;
      if (amount <= 0) continue;

      const start = supplies[i].timestamp;
      sections.push({ type: "cliff", start, amount });
    } catch {
      let a = i;
    }
  }

  return sections;
}