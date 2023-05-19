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
import { RESOLUTION_SECONDS, INCOMPLETE_SECTION_STEP } from "./constants";
import { unixTimestampNow } from "./time";

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
  const chartData: any[] = [];
  data.rawSections.map((r: any) => {
    r.results.map((d: any) =>
      chartData.push({
        data: rawToChartData(protocol, d, data.startTime, data.endTime, isTest),
        section: r.section,
      }),
    );
  });

  await appendMissingDataSections(chartData, protocol, data, isTest);
  return consolidateDuplicateKeys(chartData, isTest);
}
async function appendMissingDataSections(
  chartData: ChartSection[],
  protocol: string,
  data: {
    rawSections: RawSection[];
    metadata: Metadata;
    startTime: number;
    endTime: number;
  },
  isTest: boolean,
) {
  const incompleteSections = data.metadata.incompleteSections;
  if (incompleteSections == null || incompleteSections.length == 0) return;

  // const res = (
  //   await fetch(`https://api.llama.fi/emission/${protocol}`)
  //     .then((r) => r.json())
  //     .then((r) => JSON.parse(r.body))
  // ).data;

  protocol;
  const res: any[] = [];

  incompleteSections.map((i: IncompleteSection) => {
    const sectionRes: any = res.find((s: ApiChartData) => s.label == i.key);

    let unlocked: number[] = [];
    let timestamps: number[] = [];
    let apiData: ApiChartData[] = [];
    if (sectionRes) {
      apiData = sectionRes.data;

      // i.lastRecord will be included in the next fetch
      const apiDataWithoutForecast: ApiChartData[] = apiData.filter(
        (a: ApiChartData) => a.timestamp < i.lastRecord,
      );
      timestamps = apiDataWithoutForecast.map((d: ApiChartData) => d.timestamp);
      unlocked = apiDataWithoutForecast.map((d: ApiChartData) => d.unlocked);
      appendOldApiData(chartData, unlocked, apiData, i, timestamps);
    }
    appendForecast(chartData, unlocked, i, data, isTest);
  });
}
function appendOldApiData(
  chartData: ChartSection[],
  unlocked: number[],
  apiData: ApiChartData[],
  incompleteSection: IncompleteSection,
  timestamps: number[],
) {
  chartData.push({
    data: { isContinuous: false, timestamps, unlocked, apiData },
    section: incompleteSection.key,
  });
}
function appendForecast(
  chartData: ChartSection[],
  unlocked: number[],
  incompleteSection: IncompleteSection,
  data: {
    rawSections: RawSection[];
    metadata: Metadata;
    startTime: number;
    endTime: number;
  },
  isTest: boolean,
) {
  if (!incompleteSection.allocation) return;

  const timestamp =
    Math.floor(unixTimestampNow() / RESOLUTION_SECONDS) * RESOLUTION_SECONDS;

  const relatedSections = chartData.filter(
    (d: ChartSection) => d.section == incompleteSection.key,
  );

  const reference: number =
    unlocked.length > 0 ? unlocked[unlocked.length - 1] : 0;

  let emitted: number | undefined = relatedSections
    .map((d: ChartSection) => d.data.unlocked[d.data.unlocked.length - 1])
    .reduce((p: number, c: number) => p + c, reference);
  if (!emitted) emitted = 0;

  chartData.push({
    data: rawToChartData(
      "",
      [
        {
          timestamp,
          change: incompleteSection.allocation - emitted,
          continuousEnd: data.endTime,
        },
      ],
      data.startTime,
      data.endTime,
      isTest,
    ),
    section: incompleteSection.key,
  });

  if (!("notes" in data.metadata)) data.metadata.notes = [];
  data.metadata.notes?.push(
    `Only past ${incompleteSection.key} unlocks have been included in this analysis, because ${incompleteSection.key} allocation is unlocked adhoc. Future unlocks have been interpolated, which may not be accurate.`,
  );

  // MAKE SURE THIS IS ALL UPDATING NICELY
  incompleteSection.lastRecord = timestamp + INCOMPLETE_SECTION_STEP;

  // const sectionIndex = data.metadata.incompleteSections?.indexOf(incompleteSection)
  // // this timestamp will be queried on the next run
  // if (data.metadata.incompleteSections?[sectionIndex] != null)
  // data.metadata.incompleteSections?[sectionIndex].lastRecord = timestamp + INCOMPLETE_SECTION_STEP;
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
export function rawToChartData(
  protocol: string,
  raw: RawResult[],
  start: number,
  end: number,
  isTest: boolean = true,
): ChartData {
  const roundedStart: number =
    Math.floor(start / RESOLUTION_SECONDS) * RESOLUTION_SECONDS;
  const roundedEnd: number =
    Math.ceil(end / RESOLUTION_SECONDS) * RESOLUTION_SECONDS;
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
    protocol,
  };
  raw.sort((r: RawResult) => r.timestamp);

  return raw[0].continuousEnd ? continuous(raw, config) : discreet(raw, config);
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
    (raw[0].change * RESOLUTION_SECONDS) /
    (raw[0].continuousEnd - raw[0].timestamp);

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
function discreet(raw: RawResult[], config: ChartConfig): ChartData {
  let {
    steps,
    timestamps,
    unlocked,
    workingQuantity,
    workingTimestamp,
    isTest,
    apiData,
  } = config;

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
