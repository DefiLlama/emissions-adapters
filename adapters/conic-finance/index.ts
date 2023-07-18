import fetch from "node-fetch";
import { call } from "@defillama/sdk/build/abi/abi2";
import { CliffAdapterResult } from "../../types/adapters";
import { filterRawAmounts, findBlockHeightArray } from "../../utils/chainCalls";
import { PromisePool } from "@supercharge/promise-pool";

let res: number;

export async function latest(): Promise<number> {
  return 1677715200
  if (!res)
    return fetch(`https://api.llama.fi/emission/conic-finance`)
      .then((r) => r.json())
      .then((r) => JSON.parse(r.body))
      .then((r) =>
        r.metadata.incompleteSections == null ||
        r.metadata.incompleteSections[0].lastRecord == null
          ? 1677715200
          : r.metadata.incompleteSections[0].lastRecord,
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

  return filterRawAmounts(chainData, decimals);
}
