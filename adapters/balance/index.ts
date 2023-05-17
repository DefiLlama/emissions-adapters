import { multiCall } from "@defillama/sdk/build/abi/abi2";
import fetch from "node-fetch";
import { call } from "@defillama/sdk/build/abi/abi2";
import { CliffAdapterResult } from "../../types/adapters";
import { isFuture } from "../../utils/time";
import { getBlock2 } from "../../utils/block";
import { INCOMPLETE_SECTION_STEP } from "../../utils/constants";

type BlockTime = {
  block: number;
  timestamp: number;
};

let res: number;

export async function latestDao(
  adapter: string,
  timestampDeployed: number,
): Promise<number> {
  if (!res)
    return fetch(`https://api.llama.fi/emission/${adapter}`)
      .then(r => r.json())
      .then(r => JSON.parse(r.body))
      .then(
        r =>
          r.metadata.incompleteSections == null ||
          r.metadata.incompleteSections.lastRecord == null
            ? timestampDeployed
            : r.metadata.incompleteSections.lastRecord,
      );
  return res;
}

export async function daoSchedule(
  owners: string[],
  target: string,
  chain: any,
  adapter: string,
  timestampDeployed: number,
): Promise<CliffAdapterResult[]> {
  let trackedTimestamp: number;
  let decimals: number;

  [trackedTimestamp, decimals] = await Promise.all([
    latestDao(adapter, timestampDeployed),
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

  let balances = await Promise.all(
    blockHeights.map((b: BlockTime) =>
      multiCall({
        calls: owners.map((o: string) => ({ target, params: [o] })),
        abi: "erc20:balanceOf",
        chain,
        block: b.block,
        requery: true,
      }).then((r: (number | null)[]) => {
        if (r.includes(null))
          throw new Error(`balance call failed for ${adapter}`);
        return r.reduce((p: number, c: any) => Number(p) + Number(c), 0);
      }),
    ),
  );

  if (balances.length != blockHeights.length)
    throw new Error(
      `block mismatch in ${adapter} ecosystem and rewards adapter`,
    );

  const sections: CliffAdapterResult[] = [];
  let depositIndex: number = 0;
  for (let i = 0; i < balances.length; i++) {
    const thisBalance: number = balances[i];
    if (depositIndex == 0 && thisBalance == 0) continue;

    depositIndex += 1;
    if (depositIndex == 1) continue;

    const amount = (balances[i - 1] - thisBalance) / 10 ** decimals;
    if (amount <= 0) continue;

    const start = blockHeights[i].timestamp;
    sections.push({ type: "cliff", start, amount });
  }
  return sections;
}
