import {
  AdapterResult,
  CliffAdapterResult,
  LinearAdapterResult,
  Metadata,
  StepAdapterResult,
} from "../types/adapters";
import { ratePerPeriod, isFuture } from "./time";

const precision: number = 4;

export function addResultToEvents(
  section: string,
  metadata: Metadata,
  results: AdapterResult[],
): Metadata {
  const [cliffs, steps, linears]: any = [
    "cliff",
    "step",
    "linear",
  ].map((t: any) => filterResultsByType(results, t));

  cliffs.map((c: CliffAdapterResult) => {
    metadata.events.push({
      description: `A cliff of {tokens[0]} tokens ${isFuture(c.start)
        ? "will"
        : "was"} unlock${isFuture(c.start)
        ? ""
        : "ed"} from ${section} on {timestamp}`,
      timestamp: c.start,
      noOfTokens: [c.amount],
    });
  });

  linears.map((l: LinearAdapterResult, i: number) => {
    if (i == linears.length) return;
    const l2 = linears[i];
    const thisRate = i == 0 ? 0 : ratePerPeriod(l, precision);
    const nextRate = ratePerPeriod(l2, precision);
    if (Math.abs(Number(thisRate) - Number(nextRate)) / thisRate < 0.001)
      return;
    metadata.events.push({
      description: `Linear unlock ${isFuture(l.start)
        ? "will"
        : "was"} ${Number(thisRate) > Number(nextRate)
        ? "decrease"
        : "increase"}${isFuture(l.start)
        ? ""
        : "d"} from {tokens[0]} to {tokens[1]} tokens per week from ${section} on {timestamp}`,
      timestamp: l.start,
      noOfTokens: [thisRate, nextRate],
    });
  });

  steps.map((s: StepAdapterResult) => {
    for (let i = 0; i < s.steps; i++) {
      metadata.events.push({
        description: `On {timestamp} {tokens[0]} of ${section} tokens ${isFuture(
          s.start + i * s.stepDuration,
        )
          ? "will be"
          : "were"} unlocked
        `,
        timestamp: s.start + i * s.stepDuration,
        noOfTokens: [s.amount],
      });
    }
  });

  return metadata;
}
const filterResultsByType = (
  results: AdapterResult[],
  type: "cliff" | "linear" | "step",
) => results.filter((r: AdapterResult) => r.type == type);
