import {
  Categories,
  ChartSection,
  TransposedApiChartData,
  Allocations,
} from "../types/adapters";
import { RESOLUTION_SECONDS } from "./constants";
import { unixTimestampNow } from "./time";

type Unlocks = { current: number; final: number };

function normalizeAllocations(rawAllocations: Allocations): Allocations {
  const total: number = Object.values(rawAllocations).reduce(
    (p: number, c: number) => p + c,
    0,
  );
  const normalAllocations: Allocations = {};

  Object.keys(rawAllocations).map((c: string) => {
    normalAllocations[c] = Number(
      ((100 * rawAllocations[c]) / total).toFixed(1),
    );
  });

  return normalAllocations;
}

export function createCategoryData(
  data: any,
  categories: Categories,
  isTest: boolean = true,
): { [allocations: string]: Allocations } {
  const rawCurrentAllocations: Allocations = {};
  const rawFinalAllocations: Allocations = {};

  Object.keys(categories).map((c: string) => {
    rawCurrentAllocations[c] = 0;
    rawFinalAllocations[c] = 0;

    categories[c].map((section: string) => {
      const timestampNow: number = unixTimestampNow();

      const { current, final } = isTest
        ? findRawAllocationTest()
        : findRawAllocationServer();

      function findRawAllocationTest(): Unlocks {
        const testData: ChartSection[] = <ChartSection[]>data;
        const s = testData.find((d: any) => d.section == section);
        if (!s) return { current: 0, final: 0 };

        const currentEntryIndex = s.data.timestamps.findIndex(
          (t: number) =>
            timestampNow - RESOLUTION_SECONDS < t && t < timestampNow,
        );
        const finalEntryIndex = s.data.unlocked.length - 1;
        const current =
          s.data.unlocked[
            currentEntryIndex == -1 ? finalEntryIndex : currentEntryIndex
          ];
        const final = s.data.unlocked[finalEntryIndex];
        return { current, final };
      }

      function findRawAllocationServer(): Unlocks {
        const serverData: TransposedApiChartData[] = <TransposedApiChartData[]>(
          data
        );
        const s: TransposedApiChartData | undefined = serverData.find(
          (d: any) => d.label == section,
        );
        if (!s) return { current: 0, final: 0 };

        const final: number = s.data[s.data.length - 1].unlocked;
        const current: number =
          s.data.find(
            (t: any) =>
              timestampNow - RESOLUTION_SECONDS < t.timestamp &&
              t.timestamp < timestampNow,
          )?.unlocked ?? final;

        return { current, final };
      }

      rawCurrentAllocations[c] += current;
      rawFinalAllocations[c] += final;
    });
  });

  return {
    current: normalizeAllocations(rawCurrentAllocations),
    final: normalizeAllocations(rawFinalAllocations),
  };
}
