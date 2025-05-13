import {
  AdapterResult,
  StepAdapterResult,
  CliffAdapterResult,
  LinearAdapterResult,
  RawResult,
  RawSection,
  Protocol,
  SectionData,
  Metadata,
  Event,
} from "../types/adapters";
import { addResultToEvents } from "./events";
const excludedKeys = ["meta", "categories", "documented"];

export async function createRawSections(
  adapter: Protocol,
  backfill: boolean = false
): Promise<SectionData> {
  let startTime: number = 10000000000;
  let endTime: number = 0;
  let rawSections: RawSection[] = [];
  let documented: RawSection[] = [];
  let metadata: Metadata = {
    token: "",
    sources: [],
    protocolIds: [],
    events: [],
  };
  let categories: { [category: string]: string[] } = {};

  let allCliffAllocations: any[] = [];
  let allLinearAllocations: any[] = [];

  await Promise.all(
    Object.entries(adapter).map(async (a: any[]) => {
      if (a[0] == "meta") {
        metadata = <Metadata>a[1];
        if ("incompleteSections" in a[1]) {
          await Promise.all(
            Object.entries(a[1].incompleteSections).map(async (c: any) => {
              a[1].incompleteSections[c[0]].lastRecord =
                await a[1].incompleteSections[c[0]].lastRecord(backfill);
            }),
          );
        }
      }

      if (a[0] == "categories") categories = a[1];
      if (a[0] == "documented") {
        await Promise.all(
          Object.entries(a[1]).map(async (b: any[]) => {
            if (b[0] == "replaces") return;
            await sectionToRaw(documented, b);
          }),
        );
      }

      if (excludedKeys.includes(a[0])) return;

      await sectionToRaw(rawSections, a);

      async function sectionToRaw(key: RawSection[], entry: any[]) {
        const section: string = entry[0];
        if (typeof entry[1] === "function") {
          entry[1] = entry[1](backfill);
        }
        let adapterResults = await entry[1];
        if (adapterResults.length == null) adapterResults = [adapterResults];
        adapterResults = adapterResults.map((r: any) =>
          typeof r === "function" ? r(backfill).then() : r,
        );
        adapterResults = await Promise.all(adapterResults);

        const { cliffAllocations, linearAllocations } = addResultToEvents(section, metadata, adapterResults, categories);
        allCliffAllocations.push(...cliffAllocations);
        allLinearAllocations.push(...linearAllocations);

        const results: RawResult[] | RawResult[][] = adapterResults
          .flat()
          .map((r: AdapterResult) => {
            switch (r.type) {
              case "step":
                return stepAdapterToRaw(<StepAdapterResult>r);
              case "cliff":
                return cliffAdapterToRaw(<CliffAdapterResult>r);
              case "linear":
                return linearAdapterToRaw(<LinearAdapterResult>r);
              default:
                throw new Error(`invalid adapter type: ${r.type}`);
            }
          });

        key.push({ section, results });

        startTime = Math.min(
          startTime,
          ...adapterResults.flat().map((r: AdapterResult) => r.start!),
        );

        endTime = Math.max(
          endTime,
          ...results
            .flat()
            .map((r: any) =>
              r.continuousEnd == null ? r.timestamp : r.continuousEnd,
            ),
        );
      }
    }),
  );

  if (metadata && metadata.events)
    metadata.events.sort((a: Event, b: Event) => a.timestamp - b.timestamp);


  const unlockEventMap: { [timestamp: number]: { cliffAllocations: any[]; linearAllocations: any[] } } = {};
  allCliffAllocations.forEach((a) => {
    if (!unlockEventMap[a.timestamp]) unlockEventMap[a.timestamp] = { cliffAllocations: [], linearAllocations: [] };
    unlockEventMap[a.timestamp].cliffAllocations.push(a);
  });
  allLinearAllocations.forEach((a) => {
    if (!unlockEventMap[a.timestamp]) unlockEventMap[a.timestamp] = { cliffAllocations: [], linearAllocations: [] };
    unlockEventMap[a.timestamp].linearAllocations.push(a);
  });
  metadata.unlockEvents = [];
  for (const [timestampStr, { cliffAllocations, linearAllocations }] of Object.entries(unlockEventMap)) {
    const timestamp = Number(timestampStr);
    const totalTokensCliff = cliffAllocations.reduce((sum, a) => sum + (a.amount || 0), 0);
    const netChangeInWeeklyRate = linearAllocations.reduce((sum, a) => sum + ((a.newRatePerWeek || 0) - (a.previousRatePerWeek || 0)), 0);
    const totalNewWeeklyRate = linearAllocations.reduce((sum, a) => sum + (a.newRatePerWeek || 0), 0);
    metadata.unlockEvents.push({
      timestamp,
      cliffAllocations: cliffAllocations.map(({ timestamp, ...rest }) => rest),
      linearAllocations: linearAllocations.map(({ timestamp, ...rest }) => rest),
      summary: {
        totalTokensCliff: totalTokensCliff > 0 ? totalTokensCliff : undefined,
        netChangeInWeeklyRate: netChangeInWeeklyRate !== 0 ? netChangeInWeeklyRate : undefined,
        totalNewWeeklyRate: totalNewWeeklyRate > 0 ? totalNewWeeklyRate : undefined,
      }
    });
  }
  metadata.unlockEvents.sort((a, b) => a.timestamp - b.timestamp);

  return { rawSections, documented, startTime, endTime, metadata, categories };
}
function stepAdapterToRaw(result: StepAdapterResult): RawResult[] {
  const output: RawResult[] = [];
  for (let i = 0; i < result.steps; i++) {
    const timestamp: number =
      Number(result.start) + (i + 1) * result.stepDuration;
    output.push({
      timestamp,
      change: result.amount,
      continuousEnd: undefined,
    });
  }
  return output;
}
function cliffAdapterToRaw(result: CliffAdapterResult): RawResult[] {
  return [
    {
      timestamp: result.start,
      change: result.amount,
      continuousEnd: undefined,
    },
  ];
}
function linearAdapterToRaw(result: LinearAdapterResult): RawResult[] {
  return [
    {
      timestamp: result.start,
      change: result.amount,
      continuousEnd: result.end,
    },
  ];
}
