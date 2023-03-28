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
  Event
} from "../types/adapters";
import { addResultToEvents } from "./events";
const excludedKeys = ["sources", "notes", "token", "protocolIds"];

export async function createRawSections(
  adapter: Protocol,
): Promise<SectionData> {
  let startTime: number = 10_000_000_000;
  let endTime: number = 0;
  const rawSections: RawSection[] = [];
  let metadata: Metadata = { token: "", sources: [], protocolIds: [], events: [] };

  await Promise.all(
    Object.entries(adapter.default).map(async (a: any[]) => {
      if (excludedKeys.includes(a[0])) {
        metadata[a[0] as keyof typeof metadata] = a[1];
        return;
      }
      const section: string = a[0];
      let adapterResults = await a[1];
      if (adapterResults.length == null) adapterResults = [adapterResults];

      addResultToEvents(section, metadata, adapterResults)

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

  metadata.events.sort((a: Event, b: Event) => a.timestamp - b.timestamp)
  
  for (let i = 0; i < Math.min(5, metadata.events.length); i++) {
    console.log(metadata.events[i].description)
  }

  if (!("protocolIds" in metadata))
    throw new Error(`protocol must have a 'protocolIds' string[] property`);
  return { rawSections, startTime, endTime, metadata };
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
