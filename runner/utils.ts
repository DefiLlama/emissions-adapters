import fetch from "node-fetch";
import { createChartData, mapToServerData, nullFinder } from "../utils/convertToChartData";
import { createRawSections } from "../utils/convertToRawData";
import { createCategoryData, createSectionData } from "../utils/categoryData";
import { ChartSection, EmissionBreakdown, Protocol, SectionData, isProtocolV2, ProtocolV2, ProcessedProtocolV2, ComponentResult, AdapterResult } from "../types/adapters";
import { createFuturesData } from "../utils/futures";
import { storeR2JSONString } from "./r2";
import { protocolsIncentives } from "../no-emissions/incentives";
import { V2Processor } from "../utils/v2-processor";

const sluggifyString = (name: string) => name.toLowerCase().split(" ").join("-").split("'").join("");
let protocols: any = {}
let parentProtocols: any = {}
let chainKeyToLabelMap: any = {}

const chainNameCache: Record<string, string> = {}

function getDisplayChainNameCached(chain = '') {
  if (!chainNameCache[chain]) {
    chainNameCache[chain] = chainKeyToLabelMap[chain] ?? (chain.slice(0, 1).toUpperCase() + chain.slice(1));
  }
  return chainNameCache[chain];
}

// pull protocol metadata from api.llama.fi
export async function init() {
  const response = await fetch("https://api.llama.fi/_fe/static/configs");
  const data = await response.json();
  protocols = data.protocols;
  parentProtocols = data.parentProtocols;
  chainKeyToLabelMap = data.chainKeyToLabelMap;
}

const prefix = "coingecko:";

function getCgId(token: string) {
  const idStart = token.indexOf(prefix);
  if (idStart == -1) return null;
  return token.substring(idStart + prefix.length);
}
function findPId(cgId?: string | null, parentId?: string) {
  if (!cgId && !parentId) return;
  const parent = parentProtocols.find((p: any) => (parentId ? p.id == parentId : p.gecko_id == cgId));
  if (parent) return { parentProtocol: parent.id, name: parent.name, gecko_id: parent.gecko_id };
  return protocols.find((p: any) => p.gecko_id == cgId);
}

async function aggregateMetadata(
  protocolName: string,
  realTimeChart: ChartSection[],
  documentedChart: ChartSection[],
  rawData: SectionData,
) {
  const pId = rawData.metadata.protocolIds?.[0] ?? null;
  const pData0 = protocols.find((p: any) => p.id == pId);
  const cgId = getCgId(rawData.metadata.token) ?? pData0?.gecko_id;
  const pData = findPId(cgId, pId?.startsWith("parent#") ? pId : pData0?.parentProtocol) ?? pData0;
  const id = pData ? pData.name : cgId ? cgId : protocolName;
  let defillamaIds = [rawData.metadata.protocolIds?.[0]].filter(Boolean)
  const protocolCategory = protocols.find((p: any) => p.id === pId || p.parentProtocol === pId)?.category;
  //transform parent#id to ids
  if (pId?.startsWith("parent#")) {
    const childIds = protocols
      .filter((protocol: any) => protocol.parentProtocol === pId)
      .map((protocol: any) => protocol.id);

    defillamaIds = childIds.length ? childIds : [];
  }


  const factories: string[] = ["daomaker"];
  if (factories.includes(protocolName) && !(pData || cgId))
    throw new Error(`no metadata for raw token ${rawData.metadata.token}`);

  let name = id;
  let gecko_id = pData?.gecko_id ?? cgId;

  if (pData?.parentProtocol) {
    name = parentProtocols.find((p: any) => p.id === pData.parentProtocol)?.name ?? id;
    gecko_id = parentProtocols.find((p: any) => p.id === pData.parentProtocol)?.gecko_id ?? pData?.gecko_id;
  }

  const realTimeTokenAllocation = createCategoryData(realTimeChart, rawData.categories);
  const realTimeSectionAllocation = createSectionData(realTimeChart);
  const documentedTokenAllocation = createCategoryData(documentedChart, rawData.categories);
  const documentedSectionAllocation = createSectionData(documentedChart);

  const futures = pData && "symbol" in pData ? await createFuturesData(pData.symbol) : undefined;
  const chainName = getDisplayChainNameCached(rawData.metadata?.chain ?? "");

  let documentedData;
  let realTimeData;
  if (documentedChart.length) {
    documentedData = {
      data: mapToServerData(documentedChart),
      tokenAllocation: {
        ...documentedTokenAllocation,
        bySection: documentedSectionAllocation,
      },
    };
    realTimeData = {
      data: mapToServerData(realTimeChart),
      tokenAllocation: {
        ...realTimeTokenAllocation,
        bySection: realTimeSectionAllocation,
      },
    };
  } else {
    documentedData = {
      data: mapToServerData(realTimeChart),
      tokenAllocation: {
        ...realTimeTokenAllocation,
        bySection: realTimeSectionAllocation,
      },
    };
  }

  return {
    data: {
      realTimeData,
      documentedData,
      metadata: rawData.metadata,
      name,
      gecko_id,
      futures,
      defillamaIds,
      categories: rawData.categories,
      protocolCategory,
      chainName,
      pId
    },
    id,
  };
}

async function getPricedUnlockChart(emissionData: Awaited<ReturnType<typeof aggregateMetadata>>["data"], v2ProcessedData?: ProcessedProtocolV2, priceCache?: Record<string, number>) {
  try {
    const hasIncentives = emissionData.pId ? protocolsIncentives.includes(emissionData.pId) : false;

    if (!hasIncentives && !v2ProcessedData) {
      return [];
    }

    const unlocksByTimestamp: Record<string, number> = {};
    const now = new Date().getTime() / 1000;
    const currDate = new Date().getTime() / 1000;

    if (v2ProcessedData) {
      for (const section of v2ProcessedData.sections) {
        for (const componentResult of section.components) {
          if (!componentResult.flags.isIncentive) continue;

          componentResult.results.forEach((result: AdapterResult) => {
            if (result.type === "cliff" && typeof result.start === 'number') {
              if (result.start < now) {
                unlocksByTimestamp[result.start] = (unlocksByTimestamp[result.start] || 0) + result.amount;
              }
            } else if (result.type === "linear" && typeof result.start === 'number' && typeof result.end === 'number') {
              const duration = result.end - result.start;
              const dailyAmount = result.amount / (duration / (24 * 60 * 60));

              for (let timestamp = result.start; timestamp < result.end && timestamp < now; timestamp += 24 * 60 * 60) {
                unlocksByTimestamp[timestamp] = (unlocksByTimestamp[timestamp] || 0) + dailyAmount;
              }
            } else if (result.type === "step" && typeof result.start === 'number') {
              const stepResult = result as any;
              const stepAmount = result.amount;

              for (let i = 0; i < stepResult.steps; i++) {
                const stepTimestamp = result.start + (i + 1) * stepResult.stepDuration;
                if (stepTimestamp < now) {
                  unlocksByTimestamp[stepTimestamp] = (unlocksByTimestamp[stepTimestamp] || 0) + stepAmount;
                }
              }
            }
          });
        }
      }
    } else {
      //v1
      const incentiveCategories = ["farming"];
      const incentiveSections = incentiveCategories
        .map((cat) => emissionData?.categories[cat])
        .flat()
        .filter(Boolean);

      const excludedSections = emissionData?.metadata?.excludeFromAdjustedSupply || [];
      const allIncentiveSections = [...incentiveSections, ...excludedSections];

      emissionData.documentedData.data.forEach(
        (chart: { data: Array<{ timestamp: number; rawEmission: number }>; label: string }) => {
          if (!allIncentiveSections?.includes(chart.label)) return;

          chart.data
            .filter((val) => val.timestamp < currDate)
            .forEach((val) => {
              if (val.timestamp < now)
                unlocksByTimestamp[val.timestamp] = (unlocksByTimestamp[val.timestamp] || 0) + val.rawEmission;
            });
        }
      );
    }

    const timestamps = Object.keys(unlocksByTimestamp);

    if (timestamps.length === 0) {
      return [];
    }

    let prices: Record<string, number> = {};
    const token = emissionData?.metadata?.token;

    if (priceCache) {
      prices = priceCache;
    } else if (token) {
      prices = await fetchPricesForTimestamps(token, timestamps);
    }

    const chartsWithPrices = Object.entries(unlocksByTimestamp)
      .sort((a: any, b: any) => Number(a[0]) - Number(b[0]))
      .map(([ts, unlocked]: [string, number], i, arr: any[]) => {
        const currentPrice = prices[ts] || 0;

        if (v2ProcessedData) {
          const usdValue = unlocked * currentPrice;
          return [Number(ts), usdValue];
        } else {
          const previousUnlocked = arr?.[i - 1]?.[1] || 0;
          const emissionDifference = unlocked - previousUnlocked;
          const usdValue = emissionDifference * currentPrice;
          return [Number(ts), usdValue];
        }
      });

    const totalUsd = chartsWithPrices.reduce((sum, [_, val]) => sum + Number(val), 0);

    return chartsWithPrices;
  } catch (e) {
    return [];
  }
}

const getDateByDaysAgo = (days: number) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date.getTime() / 1000;
};
const sum = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0);

async function fetchPricesForTimestamps(token: string, timestamps: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};

  if (!token || timestamps.length === 0) {
    return prices;
  }

  console.log(`Fetching prices for ${timestamps.length} timestamps for token: ${token}`);

  const pricePromises = timestamps.map(async (ts) => {
    try {
      const response = await fetch(
        `https://coins.llama.fi/prices/historical/${ts}/${token}?apikey=${process.env.APIKEY}`
      );
      const price = await response.json();
      const priceValue = price?.coins?.[token]?.price;
      if (priceValue) {
        prices[ts] = priceValue;
      }
      return { ts, price: priceValue };
    } catch (error) {
      return { ts, price: undefined };
    }
  });

  await Promise.all(pricePromises);
  console.log(`Successfully fetched ${Object.keys(prices).length}/${timestamps.length} prices`);

  return prices;
}

async function generateComponentChartData(componentResult: ComponentResult, protocolToken: string, priceCache?: Record<string, number>): Promise<number[][]> {
  const unlocksByTimestamp: Record<string, number> = {};
  const now = new Date().getTime() / 1000;

  componentResult.results.forEach((result: AdapterResult) => {
    if (result.type === "cliff" && typeof result.start === 'number') {
      if (result.start < now) {
        unlocksByTimestamp[result.start] = (unlocksByTimestamp[result.start] || 0) + result.amount;
      }
    } else if (result.type === "linear" && typeof result.start === 'number' && typeof result.end === 'number') {
      const duration = result.end - result.start;
      const dailyAmount = result.amount / (duration / (24 * 60 * 60));

      for (let timestamp = result.start; timestamp < result.end && timestamp < now; timestamp += 24 * 60 * 60) {
        unlocksByTimestamp[timestamp] = (unlocksByTimestamp[timestamp] || 0) + dailyAmount;
      }
    } else if (result.type === "step" && typeof result.start === 'number') {
      const stepResult = result as any;
      const stepAmount = result.amount;

      for (let i = 0; i < stepResult.steps; i++) {
        const stepTimestamp = result.start + (i + 1) * stepResult.stepDuration;
        if (stepTimestamp < now) {
          unlocksByTimestamp[stepTimestamp] = (unlocksByTimestamp[stepTimestamp] || 0) + stepAmount;
        }
      }
    }
  });

  const timestamps = Object.keys(unlocksByTimestamp);
  let prices: Record<string, number> = {};
  const token = componentResult.component.metadata?.token || protocolToken;

  if (priceCache) {
    prices = priceCache;
  } else if (token) {
    prices = await fetchPricesForTimestamps(token, timestamps);
  }

  return Object.entries(unlocksByTimestamp)
    .sort((a: any, b: any) => Number(a[0]) - Number(b[0]))
    .map(([ts, unlocked]: [string, number]) => {
      const currentPrice = prices[ts] || 0;
      const usdValue = unlocked * currentPrice;

      return [Number(ts), usdValue];
    });
}

async function generateComponentData(v2ProcessedData: ProcessedProtocolV2, timePeriods: number[], protocolToken: string, priceCache?: Record<string, number>) {
  const [dayAgo, weekAgo, monthAgo] = timePeriods;
  const componentData = {
    sections: {} as any
  };

  for (const section of v2ProcessedData.sections) {
    const sectionData = {
      displayName: section.section.displayName || section.sectionName,
      methodology: section.section.methodology,
      isIncentive: section.section.isIncentive,
      isTBD: section.section.isTBD,
      protocols: section.section.protocols,
      emission24h: 0,
      emission7d: 0,
      emission30d: 0,
      components: {} as any
    };

    for (const componentResult of section.components) {
      const component = componentResult.component;
      const componentId = component.id;

      const componentChartData = await generateComponentChartData(componentResult, protocolToken, priceCache);

      const [day, week, month]: number[][] = [[], [], []];
      componentChartData.forEach(([ts, val]) => {
        if (Number(val) < 0) return;
        const timestamp = Number(ts);
        const value = Number(val);

        if (timestamp > monthAgo) month.push(value);
        if (timestamp > weekAgo) week.push(value);
        if (timestamp >= dayAgo) day.push(value);
      });

      const emission24h = sum(day);
      const emission7d = sum(week);
      const emission30d = sum(month);

      sectionData.emission24h += emission24h;
      sectionData.emission7d += emission7d;
      sectionData.emission30d += emission30d;

      sectionData.components[componentId] = {
        name: component.name,
        methodology: component.methodology,
        isIncentive: componentResult.flags.isIncentive,
        isTBD: componentResult.flags.isTBD,
        protocols: componentResult.flags.protocols,
        emission24h,
        emission7d,
        emission30d,
        metadata: component.metadata,
        unlockUsdChart: componentChartData
      };
    }

    componentData.sections[section.sectionName] = sectionData;
  }

  return componentData;
}

export async function processSingleProtocol(
  adapter: Protocol,
  protocolName: string,
  emissionsBrakedown: EmissionBreakdown,
  supplyMetricsBreakdown: Record<string, any>,
  backfill: boolean = false
): Promise<string> {
  const rawData = await createRawSections(adapter, backfill);
  nullFinder(rawData.rawSections, "rawSections");

  let v2ProcessedData: ProcessedProtocolV2 | undefined;
  if (isProtocolV2(adapter)) {
    v2ProcessedData = await V2Processor.processV2Protocol(adapter as ProtocolV2, backfill);
  }

  const { realTimeData, documentedData } = await createChartData(
    protocolName,
    rawData,
    adapter.documented?.replaces ?? [],
    backfill
  );
  nullFinder(realTimeData, "realTimeData");
  const { data, id } = await aggregateMetadata(protocolName, realTimeData, documentedData, rawData);

  let priceCache: Record<string, number> | undefined;
  if (v2ProcessedData && data.metadata.token) {
    const globalTimestamps: string[] = [];
    const now = new Date().getTime() / 1000;

    for (const section of v2ProcessedData.sections) {
      for (const componentResult of section.components) {
        if (!componentResult.flags.isIncentive) continue;

        componentResult.results.forEach((result: AdapterResult) => {
          if (result.type === "cliff" && typeof result.start === 'number') {
            if (result.start < now) {
              globalTimestamps.push(result.start.toString());
            }
          } else if (result.type === "linear" && typeof result.start === 'number' && typeof result.end === 'number') {
            for (let timestamp = result.start; timestamp < result.end && timestamp < now; timestamp += 24 * 60 * 60) {
              globalTimestamps.push(timestamp.toString());
            }
          } else if (result.type === "step" && typeof result.start === 'number') {
            const stepResult = result as any;
            for (let i = 0; i < stepResult.steps; i++) {
              const stepTimestamp = result.start + (i + 1) * stepResult.stepDuration;
              if (stepTimestamp < now) {
                globalTimestamps.push(stepTimestamp.toString());
              }
            }
          }
        });
      }
    }

    const componentTimestamps: string[] = [];
    for (const section of v2ProcessedData.sections) {
      for (const componentResult of section.components) {
        componentResult.results.forEach((result: AdapterResult) => {
          if (result.type === "cliff" && typeof result.start === 'number') {
            if (result.start < now) {
              componentTimestamps.push(result.start.toString());
            }
          } else if (result.type === "linear" && typeof result.start === 'number' && typeof result.end === 'number') {
            for (let timestamp = result.start; timestamp < result.end && timestamp < now; timestamp += 24 * 60 * 60) {
              componentTimestamps.push(timestamp.toString());
            }
          } else if (result.type === "step" && typeof result.start === 'number') {
            const stepResult = result as any;
            for (let i = 0; i < stepResult.steps; i++) {
              const stepTimestamp = result.start + (i + 1) * stepResult.stepDuration;
              if (stepTimestamp < now) {
                componentTimestamps.push(stepTimestamp.toString());
              }
            }
          }
        });
      }
    }

    const allTimestamps = [...globalTimestamps, ...componentTimestamps];
    const uniqueTimestamps = [...new Set(allTimestamps)];


    if (uniqueTimestamps.length > 0) {
      priceCache = await fetchPricesForTimestamps(data.metadata.token, uniqueTimestamps);
    }
  }

  const unlockUsdChart = await getPricedUnlockChart(data, v2ProcessedData, priceCache);
  const weekAgo = getDateByDaysAgo(7);
  const dayAgo = getDateByDaysAgo(1);
  const monthAgo = getDateByDaysAgo(30);
  const yearAgo = getDateByDaysAgo(365);

  const [day, week, month, year, allTime]: number[][] = [[], [], [], [], []];

  const sluggifiedId = sluggifyString(id).replace("parent#", "");
  unlockUsdChart.forEach(([ts, val]) => {
    if (Number(val) < 0) return;
    const timestamp = Number(ts);
    const value = Number(val);

    allTime.push(value);
    if (timestamp > yearAgo) year.push(value);
    if (timestamp > monthAgo) month.push(value);
    if (timestamp > weekAgo) week.push(value);
    if (timestamp >= dayAgo) day.push(value);
  });

  const emissions1y = sum(year);
  const emissionsAllTime = sum(allTime);
  const emissionsAverage1y = year.length > 0 ? emissions1y / 12 : 0;
  const emissionsMonthlyAverage1y = year.length >= 30 ? (emissions1y / year.length) * 30.44 : null;

  const breakdown = {
    name: data.name,
    defillamaId: data.defillamaIds[0] || "",
    linked: data.defillamaIds.length > 1 ? data.defillamaIds.slice(1) : [],
    category: data.protocolCategory,
    chain: data.chainName,
    emission24h: sum(day),
    emission7d: sum(week),
    emission30d: sum(month),
    emissions1y,
    emissionsAllTime,
    emissionsAverage1y,
    emissionsMonthlyAverage1y,
  };

  //if (sum([breakdown.emission24h, breakdown.emission7d, breakdown.emission30d]) > 0) 
  emissionsBrakedown[sluggifiedId] = breakdown;

  let supplyMetrics;
  if (v2ProcessedData) {
    supplyMetrics = v2ProcessedData.supplyMetrics;
  } else {
    try {
      supplyMetrics = await V2Processor.calculateAdjustedSupplyMetrics(
        [],
        adapter as any,
        rawData.categories
      );
    } catch (error) {
      console.warn(`Could not calculate supply metrics for V1 adapter ${protocolName}:`, error);
      supplyMetrics = undefined;
    }
  }

  if (supplyMetrics) {
    supplyMetricsBreakdown[sluggifiedId] = {
      name: data.name,
      supplyMetrics: supplyMetrics
    };
  }

  const finalData = {
    ...data,
    unlockUsdChart,
    ...(supplyMetrics && { supplyMetrics }),
    ...(v2ProcessedData && {
      version: 2,
      componentData: await generateComponentData(v2ProcessedData, [dayAgo, weekAgo, monthAgo], data.metadata.token, priceCache)
    })
  };

  await storeR2JSONString(`emissions/${sluggifiedId}`, JSON.stringify(finalData));

  return sluggifiedId;
}
