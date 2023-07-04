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
import {
  RESOLUTION_SECONDS,
  INCOMPLETE_SECTION_STEP,
  GRADIENT_LENGTH,
} from "./constants";
import { periodToSeconds, unixTimestampNow } from "./time";

export async function createChartData(
  protocol: string,
  data: {
    rawSections: RawSection[];
    realTime: RawSection[];
    metadata: Metadata;
    startTime: number;
    endTime: number;
  },
  isTest: boolean = true,
): Promise<{ [key: string]: ChartSection[] }> {
  const chartData = await iterateThroughSections(data.rawSections);
  const realTimeData = await iterateThroughSections(data.realTime);
  return { chartData, realTimeData };

  async function iterateThroughSections(sections: RawSection[]) {
    const chartData: any[] = [];
    sections.map((r: any) => {
      r.results.map((s: any[]) => {
        s.map((d: any) => {
          // if (r.section != "Rewards") return;
          chartData.push({
            data: rawToChartData(
              protocol,
              d,
              data.startTime,
              data.endTime,
              isTest,
            ),
            section: r.section,
          });
        });
      });
    });

    await appendMissingDataSections(chartData, protocol, data, isTest);
    return consolidateDuplicateKeys(chartData, isTest);
  }
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

  let res = await fetch(`https://api.llama.fi/emission/${protocol}`).then((r) =>
    r.json(),
  );
  res = res.body ? JSON.parse(res.body).data : [];

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
      if (apiDataWithoutForecast.length > 0 && unlocked.length > 0)
        appendOldApiData(
          chartData,
          unlocked,
          apiDataWithoutForecast,
          i,
          timestamps,
        );
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
  const timestamp =
    Math.floor(unixTimestampNow() / RESOLUTION_SECONDS) * RESOLUTION_SECONDS;

  if (incompleteSection.allocation) {
    const relatedSections = chartData.filter(
      (d: ChartSection) => d.section == incompleteSection.key,
    );

    const reference: number =
      unlocked.length > 0 ? unlocked[unlocked.length - 1] : 0;

    const { recentlyEmitted, totalEmitted, gradientLength } =
      findPreviouslyEmitted(relatedSections, reference, isTest);

    const gradient: number =
      recentlyEmitted / (timestamp - gradientLength * RESOLUTION_SECONDS);
    const change: number = incompleteSection.allocation - totalEmitted;
    if (change < 0) return;

    const continuousEnd: number = Math.round(
      Math.min(
        timestamp + change / gradient,
        timestamp + periodToSeconds.year * 5,
      ),
    );
    chartData.push({
      data: rawToChartData(
        "",
        {
          timestamp,
          change,
          continuousEnd,
        },
        data.startTime,
        continuousEnd,
        isTest,
      ),
      section: incompleteSection.key,
    });
  }

  if (!("notes" in data.metadata)) data.metadata.notes = [];
  data.metadata.notes?.push(
    `Only past ${incompleteSection.key} unlocks have been included in this analysis, because ${incompleteSection.key} allocation is unlocked adhoc. Future unlocks have been extrapolated, which may not be accurate.`,
  );

  incompleteSection.lastRecord = timestamp + INCOMPLETE_SECTION_STEP;
}
function findPreviouslyEmitted(
  relatedSections: ChartSection[],
  reference: number,
  isTest: boolean,
): {
  recentlyEmitted: number;
  totalEmitted: number;
  gradientLength: number;
} {
  let gradientLength: number = GRADIENT_LENGTH;

  const findUnlocked = (d: any, isTest: boolean) =>
    isTest
      ? d.data.unlocked
      : d.data.apiData.map((u: ApiChartData) => u.unlocked);

  const recentlyEmitted = relatedSections
    .map((d: ChartSection) => {
      const unlocked: number[] = findUnlocked(d, isTest);
      const length: number = unlocked.length;

      if (GRADIENT_LENGTH > length) {
        gradientLength = length;
        return unlocked[length - 1];
      }

      return (
        unlocked[length - 1] - unlocked[Math.floor(length - GRADIENT_LENGTH)]
      );
    })
    .reduce((p: number, c: number) => p + c, reference);

  const totalEmitted: number | undefined = relatedSections
    .map((d: ChartSection) =>
      !isTest && d.data.apiData != null
        ? d.data.apiData[d.data.apiData.length - 1].unlocked
        : d.data.unlocked[d.data.unlocked.length - 1],
    )
    .reduce((p: number, c: number) => p + c, reference);

  return { recentlyEmitted, totalEmitted, gradientLength };
}
function consolidateDuplicateKeys(data: ChartSection[], isTest: boolean) {
  let sortedData: any[] = [];

  const sectionLengths = data.map((s: any) =>
    isTest ? s.data.unlocked.length : s.data.apiData.length,
  );
  const maxSectionLength: number = Math.max(...sectionLengths);

  data.map((d: any) => {
    const sortedKeys = sortedData.map((s: any) => s.section);

    // normalize to extrapolations
    let targetLength = isTest
      ? d.data.timestamps.length
      : d.data.apiData.length;
    while (targetLength < maxSectionLength - 1) {
      targetLength = isTest ? d.data.timestamps.length : d.data.apiData.length;
      if (isTest) {
        d.data.timestamps.push(
          d.data.timestamps[targetLength - 1] + RESOLUTION_SECONDS,
        );
        d.data.unlocked.push(d.data.unlocked[targetLength - 2]);
      } else {
        d.data.apiData.push({
          timestamp:
            d.data.apiData[targetLength - 1].timestamp + RESOLUTION_SECONDS,
          unlocked: d.data.apiData[targetLength - 2].unlocked,
        });
      }
    }

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
  raw: RawResult,
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

  return raw.continuousEnd ? continuous(raw, config) : discreet(raw, config);
}
function continuous(raw: RawResult, config: ChartConfig): ChartData {
  let {
    steps,
    timestamps,
    unlocked,
    workingQuantity,
    workingTimestamp,
    isTest,
    apiData,
  } = config;

  if (raw.continuousEnd == null)
    throw new Error(
      `some noncontinuous data has entered the continuous function`,
    );

  const dy: number =
    (raw.change * RESOLUTION_SECONDS) / (raw.continuousEnd - raw.timestamp);

  for (let i = 0; i < steps + 1; i++) {
    if (
      raw.timestamp < workingTimestamp &&
      raw.continuousEnd > workingTimestamp
    ) {
      workingQuantity += dy;
    }
    if (isTest) {
      unlocked.push(workingQuantity);
      timestamps.push(workingTimestamp);
    } else {
      apiData.push({
        timestamp: workingTimestamp,
        unlocked: workingQuantity,
      });
    }
    workingTimestamp += RESOLUTION_SECONDS;
  }

  if (isTest) {
    unlocked[unlocked.length - 1] = raw.change;
  } else {
    apiData[apiData.length - 1].unlocked = raw.change;
  }

  return { timestamps, unlocked, apiData, isContinuous: true };
}
function discreet(raw: RawResult, config: ChartConfig): ChartData {
  let {
    steps,
    timestamps,
    unlocked,
    workingQuantity,
    workingTimestamp,
    isTest,
    apiData,
  } = config;

  for (let i = 0; i < steps + 1; i++) {
    // checks if the next data point falls between the previous and next plot times
    if (
      workingTimestamp - RESOLUTION_SECONDS <= raw.timestamp &&
      raw.timestamp < workingTimestamp
    )
      workingQuantity += raw.change;

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
