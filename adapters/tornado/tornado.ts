import { call, multiCall } from "@defillama/sdk/build/abi/abi2";
import { getBlock } from "@defillama/sdk/build/computeTVL/blocks";
import { AdapterResult } from "../../types/adapters";
import { periodToSeconds } from "../../utils/time";
import { PromisePool } from "@supercharge/promise-pool";
import abi from "./abi";
import { CallOptions } from "@defillama/sdk/build/types";

type Call = {
  target: string;
  key: string;
  call: CallOptions;
  index?: number;
};

export default async function main(
  targets: string[],
  chain: any,
  eventTimestamps: { [event: string]: number },
): Promise<AdapterResult[]> {
  const results: any[] = [];
  const eventBlocks = (
    await Promise.all(
      Object.values(eventTimestamps).map((t: number) => getBlock(chain, t)),
    )
  ).map((r: any) => ("block" in r ? r.block : r.number));

  const secondsPerMonth = periodToSeconds.day * 30;

  let calls: Call[] = [];
  Object.keys(abi).map((key: string) => {
    targets.map((target: string) => {
      if (key == "vestedAmount") {
        calls.push(
          ...[0, 1, 2, 3].map(
            (n: number) =>
              <Call>{
                index: n,
                target,
                key,
                call: {
                  target,
                  abi: abi.vestedAmount,
                  chain,
                  block: eventBlocks[n],
                },
              },
          ),
        );
      } else {
        calls.push({
          target,
          key,
          call: { target, abi: abi[key as keyof typeof abi], chain },
        });
      }
    });
  });

  const callResults: any = {};
  await PromisePool.withConcurrency(1)
    .for(calls)
    .process(
      async (c: Call) =>
        await call(c.call).then((r: any) => {
          if (!(c.target in callResults)) callResults[c.target] = {};
          callResults[c.target][c.index ? `${c.key}${c.index}` : c.key] = r;
        }),
    );

  Object.values(callResults).map((r: any) => {
    const start =
      Number(r.startTimestamp) + Number(secondsPerMonth * r.cliffInMonths);
    results.push(
      ...[
        {
          type: "step",
          start,
          stepDuration: secondsPerMonth,
          amount: (r.vestedAmount3 - r.vestedAmount2) / 10 ** 18,
          steps: r.durationInMonths - r.cliffInMonths,
          receiver: r.beneficiary,
          token: r.token,
        },
        {
          type: "cliff",
          start,
          amount: (r.vestedAmount1 - r.vestedAmount) / 10 ** 18,
          receiver: r.beneficiary,
          token: r.token,
        },
      ],
    );
  });

  return results;
}
