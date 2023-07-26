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

export function swapInDocumentedData(
  data: any[],
  supplementary: ChartSection[],
  replaces: string[],
): any[] {
  supplementary.push(...data.filter((d: any) => !replaces.includes(d.section)));
  return supplementary;
}
export function nullFinder(data: any[], key: string) {
  let nulls = false;
  data.map((s: any) => {
    if (key == "realTimeData" && s.data.unlocked.indexOf(null) != -1)
      nulls = true;
    if (
      key == "rawSections" &&
      s.results.map((r: any) => r.change).indexOf(null) != -1
    )
      nulls = true;
    if (key == "preappend" && s.data.unlocked.indexOf(null) != -1) nulls = true;
    if (key == "preconsolidate" && s.data.unlocked.indexOf(null) != -1)
      nulls = true;
    if (key == "postconsolidate" && s.data.unlocked.indexOf(null) != -1)
      nulls = true;
    if (key == "apiDataMap" && s == null) nulls = true;
    if (key == "preforecast" && s.data.unlocked.indexOf(null) != -1)
      nulls = true;
    if (key == "postPush" && s.data.unlocked.indexOf(null) != -1) nulls = true;
  });
  if (nulls) {
    console.log(`nulls found at ${key}`);
  }
}
export async function createChartData(
  protocol: string,
  data: {
    rawSections: RawSection[];
    documented: RawSection[];
    metadata: Metadata;
    startTime: number;
    endTime: number;
  },
  replaces: string[],
): Promise<{ realTimeData: ChartSection[]; documentedData: ChartSection[] }> {
  const realTimeData = await iterateThroughSections(data.rawSections);
  let documentedData = await iterateThroughSections(data.documented);
  if (documentedData.length)
    documentedData = swapInDocumentedData(
      realTimeData,
      documentedData,
      replaces,
    );
  return { realTimeData, documentedData };

  async function iterateThroughSections(sections: RawSection[]) {
    if (!sections.length) return [];
    const chartData: any[] = [];
    sections.map((r: any) => {
      r.results.map((s: any[]) => {
        s.map((d: any) => {
          // if (r.section != "Rewards") return;
          chartData.push({
            data: rawToChartData(protocol, d, data.startTime, data.endTime),
            section: r.section,
          });
        });
      });
    });

    nullFinder(chartData, "preappend");
    // nulls come from the following function
    await appendMissingDataSections(chartData, protocol, data);
    nullFinder(chartData, "preconsolidate");
    const consolidated = consolidateDuplicateKeys(chartData);
    return consolidated;
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
) {
  const incompleteSections = data.metadata.incompleteSections;
  if (incompleteSections == null || incompleteSections.length == 0) return;

  let res = await fetch(`https://api.llama.fi/emission/${protocol}`).then((r) =>
    r.json(),
  );
  let body = res.body ? JSON.parse(res.body) : [];
  res = body && body.length != 0 ? body.documentedData?.data ?? body.data : [];

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
      nullFinder(unlocked, "apiDataMap");
      if (apiDataWithoutForecast.length > 0 && unlocked.length > 0)
        appendOldApiData(
          chartData,
          unlocked,
          apiDataWithoutForecast,
          i,
          timestamps,
        );
    }
    nullFinder(chartData, "preforecast");
    appendForecast(chartData, unlocked, i, data);
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
      findPreviouslyEmitted(relatedSections, reference);

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
      ),
      section: incompleteSection.key,
    });
    nullFinder(chartData, "postPush");
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
): {
  recentlyEmitted: number;
  totalEmitted: number;
  gradientLength: number;
} {
  let gradientLength: number = GRADIENT_LENGTH;

  const recentlyEmitted = relatedSections
    .map((d: ChartSection) => {
      const unlocked: number[] = d.data.unlocked;
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
    .map((d: ChartSection) => d.data.unlocked[d.data.unlocked.length - 1])
    .reduce((p: number, c: number) => p + c, reference);

  return { recentlyEmitted, totalEmitted, gradientLength };
}
function consolidateDuplicateKeys(data: ChartSection[]) {
  let sortedData: any[] = [];

  const sectionLengths = data.map((s: any) => s.data.unlocked.length);
  const maxSectionLength: number = Math.max(...sectionLengths);

  data.map((d: any) => {
    const sortedKeys = sortedData.map((s: any) => s.section);

    // normalize to extrapolations
    let targetLength = d.data.timestamps.length;
    while (targetLength < maxSectionLength - 1) {
      targetLength = d.data.timestamps.length;
      d.data.timestamps.push(
        d.data.timestamps[targetLength - 1] + RESOLUTION_SECONDS,
      );
      d.data.unlocked.push(d.data.unlocked[targetLength - 2]);
    }

    if (sortedKeys.includes(d.section)) {
      d.data.unlocked.map((a: any, i: number) => {
        const j = sortedKeys.indexOf(d.section);
        sortedData[j].data.unlocked[i] += a;
      });
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
    unlocked.push(workingQuantity);
    timestamps.push(workingTimestamp);
    workingTimestamp += RESOLUTION_SECONDS;
  }

  unlocked[unlocked.length - 1] = raw.change;

  return { timestamps, unlocked, apiData, isContinuous: true };
}
function discreet(raw: RawResult, config: ChartConfig): ChartData {
  let {
    steps,
    timestamps,
    unlocked,
    workingQuantity,
    workingTimestamp,
    apiData,
  } = config;

  for (let i = 0; i < steps + 1; i++) {
    // checks if the next data point falls between the previous and next plot times
    if (
      workingTimestamp - RESOLUTION_SECONDS <= raw.timestamp &&
      raw.timestamp < workingTimestamp
    )
      workingQuantity += raw.change;

    unlocked.push(workingQuantity);
    timestamps.push(workingTimestamp);

    workingTimestamp += RESOLUTION_SECONDS;
  }
  return { timestamps, unlocked, apiData, isContinuous: false };
}

export function mapToServerData(testData: ChartSection[]) {
  const serverData: any[] = testData.map((s: ChartSection) => {
    const label = s.section;

    const data = s.data.timestamps.map((timestamp: number, i: number) => ({
      timestamp,
      unlocked: s.data.unlocked[i],
    }));

    return { label, data };
  });

  return serverData;
}
