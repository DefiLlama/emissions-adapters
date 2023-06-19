import { multiCall } from "@defillama/sdk/build/abi/abi2";
import fetch from "node-fetch";
import { call } from "@defillama/sdk/build/abi/abi2";
import { CliffAdapterResult, BlockTime } from "../../types/adapters";
import {
  isFuture,
  periodToSeconds,
  sleep,
  unixTimestampNow,
} from "../../utils/time";
import { getBlock2 } from "../../utils/block";
import { INCOMPLETE_SECTION_STEP } from "../../utils/constants";
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
      r.metadata.incompleteSections.lastRecord == null
      ? timestampDeployed
      : r.metadata.incompleteSections.lastRecord;
  }
  return res;
}

let blockHeightsSto: { [timestamp: number]: BlockTime } = {};

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

  await Promise.all(
    allTimestamps.map(async (t: number) => {
      if (blockHeightsSto[t]) {
        console.log("saved");
        return;
      }
      blockHeightsSto[t] = await getBlock2(chain, t).then(
        (h: number | undefined) => ({
          timestamp: t,
          block: h == null ? -1 : h,
        }),
      );
    }),
  );

  const blockHeights: BlockTime[] = allTimestamps.map(
    (t: number) => blockHeightsSto[t],
  );

  let balances: any[] = [];
  try {
    balances = await Promise.all(
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
  } catch {
    for (let block of blockHeights) {
      await sleep(2000);
      balances.push(
        await multiCall({
          calls: owners.map((o: string) => ({ target, params: [o] })),
          abi: "erc20:balanceOf",
          chain,
          block: block.block,
          requery: true,
        }),
      );
    }
  }

  if (balances.length != blockHeights.length)
    throw new Error(`block mismatch in ${adapter} balance adapter`);

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

  if (sections.length == 0)
    return [
      {
        type: "cliff",
        start: unixTimestampNow() - periodToSeconds.week,
        amount: 0,
      },
    ];
  return sections;
}
