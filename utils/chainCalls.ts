import { PromisePool } from "@supercharge/promise-pool";
import { lookupBlock } from "@defillama/sdk/build/util";
import { INCOMPLETE_SECTION_STEP } from "./constants";
import { isFuture, unixTimestampNow } from "./time";
import { TimeSeriesChainData, CliffAdapterResult } from "../types/adapters";

export async function findBlockHeightArray(
  trackedTimestamp: number,
  chain: any,
): Promise<TimeSeriesChainData> {
  const allTimestamps: number[] = [];
  let currentTimestamp = trackedTimestamp;

  while (!isFuture(currentTimestamp)) {
    allTimestamps.push(currentTimestamp);
    currentTimestamp += INCOMPLETE_SECTION_STEP;
  }

  const chainData: TimeSeriesChainData = {};
  await PromisePool.withConcurrency(10)
    .for(allTimestamps)
    .process(async (t) => {
      const { block, timestamp } = await lookupBlock(t, { chain });
      chainData[block] = { timestamp };
    });

  return chainData;
}
export function filterRawAmounts(
  chainData: TimeSeriesChainData,
  decimals: number,
): CliffAdapterResult[] {
  const sections: CliffAdapterResult[] = [];
  let depositIndex: number = 0;

  const data = Object.values(chainData);
  for (let i = 0; i < data.length; i++) {
    if (!("result" in data[i])) data[i].result = i > 0 ? data[i - 1].result : 0;
    const thisBalance = data[i].result;
    if (depositIndex == 0 && thisBalance == 0) continue;

    depositIndex += 1;
    if (depositIndex == 1) continue;
    if (thisBalance == 0) continue;

    const amount = (data[i - 1].result - thisBalance) / 10 ** decimals;
    if (amount <= 0) continue;
    const start = data[i].timestamp;

    sections.push({ type: "cliff", start, amount });
  }

  if (sections.length == 0)
    return [
      {
        type: "cliff",
        start: unixTimestampNow() - INCOMPLETE_SECTION_STEP,
        amount: 0,
      },
    ];

  return sections;
}
