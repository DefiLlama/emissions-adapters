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
  IncompleteSection,
} from "../types/adapters";
import { addResultToEvents } from "./events";
const excludedKeys = ["meta", "sections", "incompleteSections"];
import { INCOMPLETE_SECTION_STEP } from "../utils/constants";

export async function createRawSections(
  adapter: Protocol,
): Promise<SectionData> {
  let startTime: number = 10000000000;
  let endTime: number = 0;
  let rawSections: RawSection[] = [];
  let metadata: Metadata = {
    token: "",
    sources: [],
    protocolIds: [],
    events: [],
  };
  adapter.default = await adapter.default;

  const incompleteSections = adapter.default.incompleteSections;
  await Promise.all(
    Object.entries(adapter.default).map(async (a: any[]) => {
      if (a[0] == "meta") {
        metadata = <Metadata>a[1];
        if ("incompleteSections" in a[1]) {
          await Promise.all(
            Object.entries(a[1].incompleteSections).map(async (c: any) => {
              a[1].incompleteSections[c[0]].lastRecord =
                await a[1].incompleteSections[c[0]].lastRecord();
            }),
          );
        }
      }

      if (excludedKeys.includes(a[0])) return;

      const section: string = a[0];
      if (typeof a[1] === "function") {
        a[1] = a[1]();
      }
      let adapterResults = await a[1];
      if (adapterResults.length == null) adapterResults = [adapterResults];
      adapterResults = adapterResults.map((r: any) =>
        typeof r === "function" ? r().then() : r,
      );
      adapterResults = await Promise.all(adapterResults);

      addResultToEvents(section, metadata, adapterResults);

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

      rawSections.push({ section, results });

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
    }),
  );

  if (incompleteSections)
    completeIncompleteSections(
      incompleteSections,
      rawSections,
      endTime,
      metadata,
    );

  if (metadata && metadata.events)
    metadata.events.sort((a: Event, b: Event) => a.timestamp - b.timestamp);

  return { rawSections, startTime, endTime, metadata };
}
function completeIncompleteSections(
  incompleteSections: any,
  rawSections: any,
  continuousEnd: any,
  metadata: any,
) {
  rawSections.map((r: any) => {
    if (
      !incompleteSections
        .map((i: IncompleteSection) => i.key)
        .includes(r.section)
    )
      return;

    const incompleteSection = incompleteSections.find(
      (i: any) => i.key == r.section,
    );

    const totalEmitted = r.results
      .map((a: any[]) =>
        a.map((b: any) => b.change).reduce((a: number, b: number) => a + b, 0),
      )
      .reduce((a: number, b: number) => a + b, 0);

    const timestamp = Math.max(
      r.results[r.results.length - 1].map((r: any) => r.timestamp),
    );

    if (incompleteSection.allocation == null) return;

    r.results.push([
      {
        timestamp,
        change: incompleteSection.allocation - totalEmitted,
        continuousEnd,
      },
    ]);

    if (!("notes" in metadata)) metadata.notes = [];
    metadata.notes.push(
      `Only past ${r.section} unlocks have been included in this analysis, because ${r.section} allocation is unlocked adhoc. Future unlocks have been interpolated, which may not be accurate.`,
    );
    metadata.custom.latestTimestamp = timestamp + INCOMPLETE_SECTION_STEP;
  });
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
