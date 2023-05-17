import { periodToSeconds } from "./time";
import {
  ChartData,
  ChartConfig,
  RawResult,
  RawSection,
  ChartSection,
  Metadata,
  IncompleteSection,
  ApiChartData,
} from "../types/adapters";
import fetch from "node-fetch";
import { RESOLUTION_SECONDS } from "./constants";

export async function createChartData(
  protocol: string,
  data: {
    rawSections: RawSection[];
    metadata: Metadata;
    startTime: number;
    endTime: number;
  },
  isTest: boolean = true,
): Promise<ChartSection[]> {
  protocol;
  const chartData: any[] = [];
  await Promise.all(data.rawSections.map(async (r: any) => {
    await Promise.all(r.results.map(async (d: any) =>
      chartData.push({
        data: await rawToChartData(protocol, d, data.startTime, data.endTime, data.metadata.incompleteSections?.find((s: IncompleteSection) => s.key == r.section) ?? undefined, isTest),
        section: r.section,
      }),
    ));
  }));

  return consolidateDuplicateKeys(chartData, isTest);
}
function consolidateDuplicateKeys(data: ChartSection[], isTest: boolean) {
  let sortedData: any[] = [];

  data.map((d: any) => {
    const sortedKeys = sortedData.map((s: any) => s.section);

    if (sortedKeys.includes(d.section)) {
      if (isTest) {
        d.data.unlocked.map((a: any, i: number) => {
          const j = sortedKeys.indexOf(d.section);
          sortedData[j].data.unlocked[i] += a;
        });
      } else {
        d.data.apiData.map((a: any, i: number) => {
          const j = sortedKeys.indexOf(d.section);
          sortedData[j].data.apiData[i].unlocked += a.unlocked;
        });
      }
    } else {
      sortedData.push(d);
    }
  });

  // filter any erroneous negative values
  sortedData.map((s: any) => {
    s.data.unlocked = s.data.unlocked.map((u: number) => (u < 0 ? 0 : u));
    return s;
  });

  return sortedData;
}
export async function rawToChartData(
  protocol: string,
  raw: RawResult[],
  start: number,
  end: number,
  incompleteSection: IncompleteSection | undefined,
  isTest: boolean = true,
): Promise<ChartData> {
  const roundedStart: number = Math.floor(start / RESOLUTION_SECONDS) * RESOLUTION_SECONDS;
  const roundedEnd: number = Math.ceil(end / RESOLUTION_SECONDS) * RESOLUTION_SECONDS;
  let config: ChartConfig = {
    roundedStart,
    roundedEnd,
    steps: (roundedEnd - roundedStart) / RESOLUTION_SECONDS,
    timestamps: [],
    unlocked: [],
    workingQuantity: 0,
    workingTimestamp: roundedStart,
    isTest,
    apiData: [],
    incompleteSection, 
    protocol
  };
  raw.sort((r: RawResult) => r.timestamp);

  return raw[0].continuousEnd ? continuous(raw, config) : await discreet(raw, config);
}
function continuous(raw: RawResult[], config: ChartConfig): ChartData {
  let {
    steps,
    timestamps,
    unlocked,
    workingQuantity,
    workingTimestamp,
    isTest,
    apiData,
  } = config;

  if (raw[0].continuousEnd == null)
    throw new Error(
      `some noncontinuous data has entered the continuous function`,
    );

  const dy: number =
    raw[0].change * RESOLUTION_SECONDS / (raw[0].continuousEnd - raw[0].timestamp);

  for (let i = 0; i < steps + 1; i++) {
    if (
      raw[0].timestamp < workingTimestamp &&
      raw[0].continuousEnd > workingTimestamp
    ) {
      workingQuantity += dy;
    }
    if (isTest) {
      unlocked.push(workingQuantity);
      timestamps.push(workingTimestamp);
    } else {
      apiData.push({ timestamp: workingTimestamp, unlocked: workingQuantity });
    }
    workingTimestamp += RESOLUTION_SECONDS;
  }
  return { timestamps, unlocked, apiData, isContinuous: true };
}
async function discreet(raw: RawResult[], config: ChartConfig): Promise<ChartData> {
  let {
    steps,
    timestamps,
    unlocked,
    workingQuantity,
    workingTimestamp,
    isTest,
    apiData,
    incompleteSection,
    protocol
  } = config;

  const res = (await fetch(`https://api.llama.fi/emission/${protocol}`)
  .then(r => r.json())
  .then(r => JSON.parse(r.body))).data.find((s: any) => s.label == incompleteSection?.key).data

  if (res != null) {
    apiData = res
    unlocked = res.map((r: ApiChartData) => r.unlocked)
    timestamps = res.map((r: ApiChartData) => r.timestamp)
  }
  let j = 0; // index of current raw data timestamp
  for (let i = 0; i < steps + 1; i++) {
    // checks if the next data point falls between the previous and next plot times
    if (j < raw.length && raw[j].timestamp < workingTimestamp) {
      workingQuantity += raw[j].change;
      j += 1;
    }
    if (isTest) {
      unlocked.push(workingQuantity);
      timestamps.push(workingTimestamp);
    } else {
      apiData.push({ timestamp: workingTimestamp, unlocked: workingQuantity });
    }
    workingTimestamp += RESOLUTION_SECONDS;
  }
  return { timestamps, unlocked, apiData, isContinuous: false };
}
