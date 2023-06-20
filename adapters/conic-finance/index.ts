import fetch from "node-fetch";
import { call } from "@defillama/sdk/build/abi/abi2";
import { CliffAdapterResult } from "../../types/adapters";
import { filterRawAmounts, findBlockHeightArray } from "../../utils/chainCalls";
import { PromisePool } from "@supercharge/promise-pool";

let res: number;

export async function latest(): Promise<number> {
  if (!res)
    return fetch(`https://api.llama.fi/emission/conic-finance`)
      .then((r) => r.json())
      .then((r) => JSON.parse(r.body))
      .then((r) =>
        r.metadata.incompleteSections == null ||
        r.metadata.incompleteSections.lastRecord == null
          ? 1677715200
          : r.metadata.incompleteSections.lastRecord,
      );
  return res;
}

export async function rebalancing(): Promise<CliffAdapterResult[]> {
  const target: string = "0x017f5f86df6aa8d5b3c01e47e410d66f356a94a6";
  const chain: string = "ethereum";
  const decimals: number = 18;

  const chainData = await findBlockHeightArray(await latest(), chain);

  await PromisePool.withConcurrency(10)
    .for(Object.keys(chainData))
    .process(
      async (block) =>
        await call({
          target,
          abi: {
            inputs: [],
            name: "totalCncMinted",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
          chain,
          block,
        }).then((r: number | null) => {
          chainData[block].result = r;
        }),
    );

  // const sections: CliffAdapterResult[] = [];
  // let atStart: boolean = true;
  // for (let i = 0; i < emitted.length; i++) {
  //   const thisBalance: number | null = emitted[i];

  //   if ((atStart && thisBalance == 0) || thisBalance == null) continue;
  //   atStart = false;

  //   const amount = (thisBalance - emitted[i - 1]) / 10 ** decimals;
  //   if (amount == 0) continue;

  //   const start = blockHeights[i].timestamp;
  //   sections.push({ type: "cliff", start, amount });
  // }

  // return sections;
  return filterRawAmounts(chainData, decimals);
}
