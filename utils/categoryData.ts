import {
  Categories,
  ChartSection,
  TransposedApiChartData,
  Allocations,
} from "../types/adapters";
import { RESOLUTION_SECONDS } from "./constants";
import { unixTimestampNow } from "./time";

type Unlocks = { current: number; final: number };

function calculateProgress(current: number, final: number): number {
  if (final === 0) return 0;
  return Number(((current / final) * 100).toFixed(1));
}

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
  data: any[],
  categories: Categories,
): { [allocations: string]: Allocations } {
  if (!data.length) return {};
  const rawCurrentAllocations: Allocations = {};
  const rawFinalAllocations: Allocations = {};
  const progressAllocations: Allocations = {};

  Object.keys(categories).map((c: string) => {
    rawCurrentAllocations[c] = 0;
    rawFinalAllocations[c] = 0;

    categories[c].map((section: string) => {
      const timestampNow: number = unixTimestampNow();

      const { current, final } = findRawAllocationTest();

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

      rawCurrentAllocations[c] += current;
      rawFinalAllocations[c] += final;
    });
      progressAllocations[c] = calculateProgress(rawCurrentAllocations[c], rawFinalAllocations[c]);
  });

  return {
    current: normalizeAllocations(rawCurrentAllocations),
    final: normalizeAllocations(rawFinalAllocations),
    progress: progressAllocations,
  };
}

export function createSectionData(
  data: ChartSection[]
): { current: Allocations; final: Allocations, progress: Allocations } {
  if (!data.length) return { current: {}, final: {}, progress: {} };
  const rawCurrentAllocations: Allocations = {};
  const rawFinalAllocations: Allocations = {};
  const progressAllocations: Allocations = {};
  const timestampNow: number = unixTimestampNow();

  data.forEach((section: ChartSection) => {
    const s = section;
    if (!s) return;
    const currentEntryIndex = s.data.timestamps.findIndex(
      (t: number) => timestampNow - RESOLUTION_SECONDS < t && t < timestampNow
    );
    const finalEntryIndex = s.data.unlocked.length - 1;
    const current =
      s.data.unlocked[
        currentEntryIndex == -1 ? finalEntryIndex : currentEntryIndex
      ];
    const final = s.data.unlocked[finalEntryIndex];
    rawCurrentAllocations[s.section] = current;
    rawFinalAllocations[s.section] = final;
    progressAllocations[s.section] = calculateProgress(current, final);
  });

  return {
    current: normalizeAllocations(rawCurrentAllocations),
    final: normalizeAllocations(rawFinalAllocations),
    progress: progressAllocations,
  };
}
