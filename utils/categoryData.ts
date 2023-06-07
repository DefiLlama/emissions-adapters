import {
  Categories,
  ChartSection,
  TransposedApiChartData,
  NormalAllocations,
} from "../types/adapters";
import { RESOLUTION_SECONDS } from "./constants";
import { unixTimestampNow } from "./time";

type RawAllocations = { [category: string]: number };
type Unlocks = { current: number; final: number };

function normalizeAllocations(
  rawAllocations: RawAllocations,
): NormalAllocations {
  const total: number = Object.values(rawAllocations).reduce(
    (p: number, c: number) => p + c,
    0,
  );
  const normalAllocations: NormalAllocations = {};

  Object.keys(rawAllocations).map((c: string) => {
    normalAllocations[c] = ((100 * rawAllocations[c]) / total).toFixed(1);
  });

  return normalAllocations;
}

export function createCategoryData(
  data: any,
  categories: Categories,
  isTest: boolean = true,
): { [allocations: string]: NormalAllocations } {
  const rawCurrentAllocations: RawAllocations = {};
  const rawFinalAllocations: RawAllocations = {};

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
        const current = s.data.unlocked[currentEntryIndex];
        const final = s.data.unlocked[s.data.unlocked.length - 1];
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

        const current: number = s.data.find(
          (t: any) =>
            timestampNow - RESOLUTION_SECONDS < t.timestamp &&
            t.timestamp < timestampNow,
        ).unlocked;
        const final: number = s.data[s.data.length - 1].unlocked;
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
