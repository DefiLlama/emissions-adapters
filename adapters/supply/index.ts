import fetch from "node-fetch";
import { call } from "@defillama/sdk/build/abi/abi2";
import { isFuture, sleep } from "../../utils/time";
import { getBlock2 } from "../../utils/block";
import { INCOMPLETE_SECTION_STEP } from "../../utils/constants";
import { CliffAdapterResult, BlockTime } from "../../types/adapters";

let res: number;

export async function latest(key: string, reference: number): Promise<number> {
  if (!res) {
    let r = await fetch(`https://api.llama.fi/emission/${key}`).then((r) =>
      r.json(),
    );
    if (!r.body) return reference;
    r = JSON.parse(r.body);
    return r.metadata.incompleteSections == null ||
      r.metadata.incompleteSections.lastRecord == null
      ? reference
      : r.metadata.incompleteSections.lastRecord;
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

  const allTimestamps: number[] = [];
  let currentTimestamp = trackedTimestamp;

  while (!isFuture(currentTimestamp)) {
    allTimestamps.push(currentTimestamp);
    currentTimestamp += INCOMPLETE_SECTION_STEP;
  }

  const blockHeights: BlockTime[] = await Promise.all(
    allTimestamps.map((t: number) =>
      getBlock2(chain, t).then((h: number | undefined) => ({
        timestamp: t,
        block: h == null ? -1 : h,
      })),
    ),
  );

  let supplies: number[] = [];
  try {
    supplies = await Promise.all(
      blockHeights.map((b: BlockTime) =>
        call({
          target,
          chain,
          abi: "erc20:totalSupply",
          block: b.block,
        }).then((res: number) => res / 10 ** decimals - excluded),
      ),
    );
  } catch {
    for (let block of blockHeights.map((b: BlockTime) => b.block)) {
      await sleep(2000);
      const supply = await call({
        block,
        target,
        chain,
        abi: "erc20:totalSupply",
      });
      supplies.push(supply / 10 ** decimals - excluded);
    }
  }

  if (supplies.length != blockHeights.length) throw new Error(`block mismatch`);

  const sections: CliffAdapterResult[] = [];
  let supplyIndex: number = 0;
  for (let i = 0; i < supplies.length; i++) {
    const thisBalance: number = supplies[i];
    if (supplyIndex == 0 && thisBalance == 0) continue;
    supplyIndex += 1;

    const amount = thisBalance - supplies[i - 1];
    if (amount <= 0) continue;

    const start = blockHeights[i].timestamp;
    sections.push({ type: "cliff", start, amount });
  }
  return sections;
}
