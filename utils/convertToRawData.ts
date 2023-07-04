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
const excludedKeys = ["meta", "categories", "realTime"];

export async function createRawSections(
  adapter: Protocol,
): Promise<SectionData> {
  let startTime: number = 10000000000;
  let endTime: number = 0;
  let rawSections: RawSection[] = [];
  let realTime: RawSection[] = [];
  let metadata: Metadata = {
    token: "",
    sources: [],
    protocolIds: [],
    events: [],
  };
  let categories: { [category: string]: string[] } = {};

  await Promise.all(
    Object.entries(adapter).map(async (a: any[]) => {
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

      if (a[0] == "categories") categories = a[1];
      if (a[0] == "realTime") {
        await Promise.all(
          Object.entries(a[1]).map(async (b: any[]) => {
            await sectionToRaw(realTime, b, true);
          }),
        );
      }

      if (excludedKeys.includes(a[0])) return;

      await sectionToRaw(rawSections, a);

      async function sectionToRaw(
        key: RawSection[],
        entry: any[],
        hi: boolean = false,
      ) {
        const section: string = entry[0];
        if (typeof entry[1] === "function") {
          entry[1] = entry[1]();
        }
        let adapterResults = await entry[1];
        if (adapterResults.length == null) adapterResults = [adapterResults];
        adapterResults = adapterResults.map((r: any) =>
          typeof r === "function" ? r().then() : r,
        );
        adapterResults = await Promise.all(adapterResults);

        addResultToEvents(section, metadata, adapterResults);

        if (hi) {
          console.log();
        }
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

  return { rawSections, realTime, startTime, endTime, metadata, categories };
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
