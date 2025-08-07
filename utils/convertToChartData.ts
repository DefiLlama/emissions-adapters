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
import { sendMessage } from "../utils/discord";

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
  backfill: boolean = false,
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
    await appendMissingDataSections(chartData, protocol, data, backfill);
    const consolidated = consolidateDuplicateKeys(chartData);
    return consolidated;
  }
}
function nullsInApiData(res: any): boolean {
  const unlockedValues = res
    .map((r: any) => r.data.map((d: any) => d.unlocked))
    .flat();
  return unlockedValues.includes(null);
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
  backfill: boolean,
) {
  const incompleteSections = data.metadata.incompleteSections;
  if (incompleteSections == null || incompleteSections.length == 0) return;

  let res: any = [];
  if (!backfill) {
    try {
      res = await fetch(`https://api.llama.fi/emission/${protocol}`).then((r) =>
        r.json(),
      );
    } catch {}
    let body = res.body ? JSON.parse(res.body) : [];
    res =
      body && body.documentedData?.data.length
        ? (body.documentedData?.data ?? body.data)
        : [];
  }

  if (nullsInApiData(res)) {
    await sendMessage(
      `${protocol} has nulls in API res`,
      process.env.UNLOCKS_WEBHOOK!,
    );
    throw new Error(`${protocol} adapter failed, nulls present`);
  }
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
    data: {
      isContinuous: false,
      timestamps,
      unlocked,
      rawEmission: unlocked.map((u) => Math.max(0, u)),
      burned: unlocked.map((u) => Math.max(0, -u)),
      apiData,
    },
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
  let err: boolean = false;
  const timestamp =
    Math.floor(unixTimestampNow() / RESOLUTION_SECONDS) * RESOLUTION_SECONDS;

  if (incompleteSection.allocation) {
    const relatedSections = chartData.filter(
      (d: ChartSection) => d.section == incompleteSection.key,
    );

    if (!relatedSections.length && unlocked.length === 0) return;

    const { recentlyEmitted, totalEmitted, gradientLength } =
      findPreviouslyEmitted(relatedSections);

    if (
      Number.isNaN(totalEmitted) ||
      totalEmitted === null ||
      totalEmitted === undefined
    ) {
      err = true;
      console.log(
        `Invalid total emitted value (NaN, null, or undefined) in ${incompleteSection.key}`,
      );
    }

    const gradientDenominator = gradientLength * RESOLUTION_SECONDS;
    const gradient: number =
      totalEmitted > 0 && recentlyEmitted > 0 && gradientDenominator > 0
        ? recentlyEmitted / gradientDenominator
        : 0;
    const change: number = incompleteSection.allocation - totalEmitted;
    if (change < 0) return;
    if (gradient > 0) {
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
  }

  if (!("notes" in data.metadata)) data.metadata.notes = [];
  data.metadata.notes?.push(
    `Only past ${incompleteSection.key} unlocks have been included in this analysis, because ${incompleteSection.key} allocation is unlocked adhoc. Future unlocks have been extrapolated, which may not be accurate.`,
  );

  incompleteSection.lastRecord = err
    ? null
    : timestamp + INCOMPLETE_SECTION_STEP;

  if (err)
    throw new Error(
      `error in ${incompleteSection.key}, probably RPC related!!!`,
    );
}
function findPreviouslyEmitted(relatedSections: ChartSection[]): {
  recentlyEmitted: number;
  totalEmitted: number;
  gradientLength: number;
} {
  let calculatedTotalEmitted: number = 0;
  let calculatedRecentlyEmitted: number = 0;

  const forecastGradientPeriodLength: number = GRADIENT_LENGTH;

  for (const d of relatedSections) {
    const unlocked: number[] = d.data.unlocked;
    const length: number = unlocked.length;

    if (length === 0) {
      continue;
    }
    const lastVal: number = unlocked[length - 1];
    calculatedTotalEmitted += lastVal;

    if (forecastGradientPeriodLength >= length) {
      calculatedRecentlyEmitted += lastVal;
    } else {
      const previousValIndex = Math.floor(
        length - forecastGradientPeriodLength,
      );
      const previousVal = unlocked[previousValIndex < 0 ? 0 : previousValIndex];
      calculatedRecentlyEmitted += lastVal - previousVal;
    }
  }

  return {
    recentlyEmitted: Math.max(0, calculatedRecentlyEmitted),
    totalEmitted: calculatedTotalEmitted,
    gradientLength: forecastGradientPeriodLength,
  };
}
function consolidateDuplicateKeys(data: ChartSection[]) {
  let sortedData: ChartSection[] = [];

  const sectionLengths = data.map((s) => s.data.unlocked.length);
  const maxSectionLength: number = Math.max(...sectionLengths);

  data.map((d) => {
    const sortedKeys = sortedData.map((s) => s.section);

    // normalize to extrapolations
    let targetLength = d.data.timestamps.length;
    while (targetLength < maxSectionLength - 1) {
      targetLength = d.data.timestamps.length;
      d.data.timestamps.push(
        d.data.timestamps[targetLength - 1] + RESOLUTION_SECONDS,
      );
      d.data.unlocked.push(d.data.unlocked[targetLength - 1]);
      d.data.rawEmission = d.data.rawEmission || [];
      d.data.burned = d.data.burned || [];
      d.data.rawEmission.push(d.data.rawEmission[targetLength - 1] || 0);
      d.data.burned.push(d.data.burned[targetLength - 1] || 0);
    }

    if (sortedKeys.includes(d.section)) {
      const j = sortedKeys.indexOf(d.section);
      d.data.unlocked.forEach((unlockVal: number, i: number) => {
        sortedData[j].data.unlocked[i] += unlockVal;
        // Initialize arrays if they don't exist
        sortedData[j].data.rawEmission =
          sortedData[j].data.rawEmission ||
          Array(d.data.unlocked.length).fill(0);
        sortedData[j].data.burned =
          sortedData[j].data.burned || Array(d.data.unlocked.length).fill(0);

        // For rawEmission, we only add positive values
        if (unlockVal > 0) {
          sortedData[j].data.rawEmission[i] += unlockVal;
        }
        // For burns, we only add negative values (as positive numbers)
        else if (unlockVal < 0) {
          sortedData[j].data.burned[i] += Math.abs(unlockVal);
        }
      });
    } else {
      // Initialize new arrays for a new section
      const rawEmission = Array(d.data.unlocked.length).fill(0);
      const burned = Array(d.data.unlocked.length).fill(0);

      // Process each value to separate emissions and burns
      d.data.unlocked.forEach((val: number, i: number) => {
        if (val > 0) {
          rawEmission[i] = val;
        } else if (val < 0) {
          burned[i] = Math.abs(val);
        }
      });

      sortedData.push({
        section: d.section,
        data: {
          ...d.data,
          rawEmission,
          burned,
        },
      });
    }
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
      raw.timestamp <= workingTimestamp &&
      raw.continuousEnd > workingTimestamp
    ) {
      workingQuantity += dy;
    }
    unlocked.push(workingQuantity);
    timestamps.push(workingTimestamp);
    workingTimestamp += RESOLUTION_SECONDS;
  }

  // unlocked[unlocked.length - 1] = raw.change;

  return {
    timestamps,
    unlocked,
    rawEmission: unlocked.map((u) => Math.max(0, u)),
    burned: unlocked.map((u) => Math.max(0, -u)),
    apiData,
    isContinuous: true,
  };
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

  let changeApplied = false;

  for (let i = 0; i < steps + 1; i++) {
    if (!changeApplied && raw.timestamp <= workingTimestamp) {
      workingQuantity += raw.change;
      changeApplied = true;
    }

    unlocked.push(workingQuantity);
    timestamps.push(workingTimestamp);

    workingTimestamp += RESOLUTION_SECONDS;
  }
  return {
    timestamps,
    unlocked,
    rawEmission: unlocked.map((u) => Math.max(0, u)),
    burned: unlocked.map((u) => Math.max(0, -u)),
    apiData,
    isContinuous: false,
  };
}

export function mapToServerData(testData: ChartSection[]) {
  const serverData: any[] = testData.map((s: ChartSection) => {
    const label = s.section;

    const data = s.data.timestamps.map((timestamp: number, i: number) => ({
      timestamp,
      unlocked: s.data.unlocked[i],
      rawEmission: s.data.rawEmission[i],
      burned: s.data.burned[i],
    }));

    return { label, data };
  });

  return serverData;
}
