import fetch from "node-fetch";
import { call } from "@defillama/sdk/build/abi/abi2";
import { CliffAdapterResult } from "../../types/adapters";
import { isFuture, periodToSeconds } from "../../utils/time";
import { getBlock2 } from "../../utils/block";

type BlockTime = {
  block: number;
  timestamp: number;
};

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
  const trackedTimestamp: number = await latest();

  const allTimestamps: number[] = [];
  let currentTimestamp = trackedTimestamp;

  while (!isFuture(currentTimestamp)) {
    allTimestamps.push(currentTimestamp);
    currentTimestamp += periodToSeconds.week;
  }

  const blockHeights: BlockTime[] = await Promise.all(
    allTimestamps.map((t: number) =>
      getBlock2(chain, t).then((h: number | undefined) => ({
        timestamp: t,
        block: h == null ? -1 : h,
      })),
    ),
  );

  const emitted = await Promise.all(
    blockHeights.map((b: BlockTime) =>
      call({
        target,
        abi: {
          inputs: [],
          name: "totalCncMinted",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        chain,
        block: b.block,
      }),
    ),
  );

  if (emitted.length != blockHeights.length)
    throw new Error(`block mismatch in conic adapter`);

  const sections: CliffAdapterResult[] = [];
  let atStart: boolean = true;
  for (let i = 0; i < emitted.length; i++) {
    const thisBalance: number | null = emitted[i];

    if ((atStart && thisBalance == 0) || thisBalance == null) continue;
    atStart = false;

    const amount = (thisBalance - emitted[i - 1]) / 10 ** decimals;
    if (amount == 0) continue;

    const start = blockHeights[i].timestamp;
    sections.push({ type: "cliff", start, amount });
  }

  return sections;
}
