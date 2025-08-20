import {
  AdapterResult,
  Categories,
  CliffAdapterResult,
  LinearAdapterResult,
  Metadata,
  StepAdapterResult,
} from "../types/adapters";
import { ratePerPeriod, isFuture } from "./time";

const precision: number = 4;

function mergeEvents(events: any[], section: string): any[] {
  const merged: { [key: string]: any } = {};

  events.forEach((event) => {
    const key = `${event.timestamp}-${event.category}-${event.unlockType}`;

    if (merged[key]) {
      merged[key].noOfTokens[0] += event.noOfTokens[0];
      if (event.unlockType === "cliff") {
        merged[key].description = `A cliff of {tokens[0]} tokens ${
          isFuture(event.timestamp) ? "will" : "was"
        } unlock${isFuture(event.timestamp) ? "" : "ed"} from ${section} on {timestamp}`;
      }
    } else {
      merged[key] = { ...event };
    }
  });

  return Object.values(merged);
}

export function addResultToEvents(
  section: string,
  metadata: Metadata,
  results: AdapterResult[],
  categories: Categories,
  categoryLookupSection?: string, // Optional: section name to use for category mapping
): { cliffAllocations: any[]; linearAllocations: any[] } {
  const sectionToCategory: { [section: string]: string } = {};
  for (const category in categories) {
    categories[category].forEach((s) => {
      sectionToCategory[s] = category;
    });
  }

  const [cliffs, steps, linears]: any = ["cliff", "step", "linear"].map(
    (t: any) => filterResultsByType(results, t),
  );

  const tempEvents: any[] = [];

  cliffs.map((c: CliffAdapterResult) => {
    if (c.amount.toFixed(2) == "0.00") return;
    // Skip cliff events that are explicitly marked as not unlocks
    if (c.isUnlock === false) return;
    tempEvents.push({
      description: `A cliff of {tokens[0]} tokens ${
        isFuture(c.start) ? "will" : "was"
      } unlock${isFuture(c.start) ? "" : "ed"} from ${section} on {timestamp}`,
      timestamp: c.start,
      noOfTokens: [c.amount],
      category:
        sectionToCategory[categoryLookupSection || section] || "Uncategorized",
      unlockType: "cliff",
    });
  });

  linears.map((l: LinearAdapterResult, i: number) => {
    if (l.isUnlock === false) return;
    // compare current with the next one if it exists
    if (i < linears.length - 1) {
      const l2 = linears[i + 1];
      const thisRate = ratePerPeriod(l, precision);
      const nextRate = ratePerPeriod(l2, precision);

      if (
        Math.abs(Number(thisRate) - Number(nextRate)) / (thisRate || 1) >=
        0.001
      ) {
        tempEvents.push({
          description: `Linear unlock ${isFuture(l2.start) ? "will" : "was"} ${
            Number(thisRate) > Number(nextRate) ? "decrease" : "increase"
          }${
            isFuture(l2.start) ? "" : "d"
          } from {tokens[0]} to {tokens[1]} tokens per week from ${section} on {timestamp}`,
          timestamp: l2.start,
          noOfTokens: [thisRate, nextRate],
          category:
            sectionToCategory[categoryLookupSection || section] ||
            "Uncategorized",
          unlockType: "linear",
          rateDurationDays: (l2.end - l2.start) / 86400,
        });
      }
    }

    // handle first linear period to show the initial rate increase from 0
    if (i === 0) {
      const initialRate = ratePerPeriod(l, precision);
      if (initialRate > 0) {
        tempEvents.push({
          description: `Linear unlock ${isFuture(l.start) ? "will" : "was"} ${
            0 > Number(initialRate) ? "decrease" : "increase"
          }${
            isFuture(l.start) ? "" : "d"
          } from {tokens[0]} to {tokens[1]} tokens per week from ${section} on {timestamp}`,
          timestamp: l.start,
          noOfTokens: [0, initialRate],
          category:
            sectionToCategory[categoryLookupSection || section] ||
            "Uncategorized",
          unlockType: "linear",
          rateDurationDays: (l.end - l.start) / 86400,
        });
      }
    }
  });

  steps.map((s: StepAdapterResult) => {
    for (let i = 0; i < s.steps; i++) {
      tempEvents.push({
        description: `On {timestamp} {tokens[0]} of ${section} tokens ${
          isFuture(s.start + i * s.stepDuration) ? "will be" : "were"
        } unlocked`,
        timestamp: s.start + i * s.stepDuration,
        noOfTokens: [s.amount],
        category:
          sectionToCategory[categoryLookupSection || section] ||
          "Uncategorized",
        unlockType: "cliff",
      });
    }
  });

  const mergedEvents = mergeEvents(tempEvents, section);

  if (!metadata.events) metadata.events = [];
  metadata.events.push(...mergedEvents);

  const cliffAllocations: any[] = [];
  const linearAllocations: any[] = [];

  cliffs.forEach((c: CliffAdapterResult) => {
    if (c.amount.toFixed(2) == "0.00") return;
    // Skip cliff events that are explicitly marked as not unlocks
    if (c.isUnlock === false) return;
    cliffAllocations.push({
      recipient: section,
      category:
        sectionToCategory[categoryLookupSection || section] || "Uncategorized",
      unlockType: "cliff",
      amount: c.amount,
      timestamp: c.start,
    });
  });

  steps.forEach((s: StepAdapterResult) => {
    for (let i = 0; i < s.steps; i++) {
      const ts = s.start + i * s.stepDuration;
      cliffAllocations.push({
        recipient: section,
        category:
          sectionToCategory[categoryLookupSection || section] ||
          "Uncategorized",
        unlockType: "cliff",
        amount: s.amount,
        timestamp: ts,
      });
    }
  });

  linears.forEach((l: LinearAdapterResult, i: number) => {
    if (l.isUnlock === false) return;
    if (i === 0) {
      const initialRate = ratePerPeriod(l, precision);
      if (initialRate > 0) {
        linearAllocations.push({
          recipient: section,
          category:
            sectionToCategory[categoryLookupSection || section] ||
            "Uncategorized",
          unlockType: "linear_start",
          previousRatePerWeek: 0,
          newRatePerWeek: initialRate,
          timestamp: l.start,
          endTimestamp: l.end,
        });
      }
    }

    if (i < linears.length - 1) {
      const l2 = linears[i + 1];
      const thisRate = ratePerPeriod(l, precision);
      const nextRate = ratePerPeriod(l2, precision);
      if (
        Math.abs(Number(thisRate) - Number(nextRate)) / (thisRate || 1) >=
        0.001
      ) {
        linearAllocations.push({
          recipient: section,
          category:
            sectionToCategory[categoryLookupSection || section] ||
            "Uncategorized",
          unlockType: "linear_rate_change",
          previousRatePerWeek: thisRate,
          newRatePerWeek: nextRate,
          timestamp: l2.start,
          endTimestamp: l2.end,
        });
      }
    }
  });

  return { cliffAllocations, linearAllocations };
}
const filterResultsByType = (
  results: AdapterResult[],
  type: "cliff" | "linear" | "step",
) => results.filter((r: AdapterResult) => r.type == type);
