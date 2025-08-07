import {
  ChartSection,
  ChartDataV2,
  ComponentChartData,
  ProcessedProtocolV2,
  ProcessedSectionV2,
  AdjustedSupplyMetrics,
  ChartData,
  StepAdapterResult,
  CliffAdapterResult,
  LinearAdapterResult,
  AdapterResult,
} from "../types/adapters";

export class V2ChartGenerator {
  static generateV2ChartData(
    protocolResults: ProcessedProtocolV2,
    sectionChartData: ChartSection[],
  ): ChartDataV2 {
    const componentChartData: ComponentChartData[] = [];

    for (const section of protocolResults.sections) {
      for (const componentResult of section.components) {
        const componentChart = V2ChartGenerator.generateComponentChart(
          section,
          componentResult,
          sectionChartData,
        );
        componentChartData.push(componentChart);
      }
    }

    const enhancedChartData: ChartDataV2 = {
      timestamps: sectionChartData[0]?.data?.timestamps || [],
      unlocked: sectionChartData[0]?.data?.unlocked || [],
      rawEmission: sectionChartData[0]?.data?.rawEmission || [],
      burned: sectionChartData[0]?.data?.burned || [],
      isContinuous: sectionChartData[0]?.data?.isContinuous || false,
      apiData: sectionChartData[0]?.data?.apiData || [],

      components: componentChartData,
      supplyMetrics: protocolResults.supplyMetrics,
    };

    return enhancedChartData;
  }

  static generateComponentChart(
    section: ProcessedSectionV2,
    componentResult: any,
    sectionChartData: ChartSection[],
  ): ComponentChartData {
    const { rawToChartData } = require("./convertToChartData");

    const allTimestamps = sectionChartData.flatMap(
      (chart) => chart.data.timestamps,
    );
    const startTime = Math.min(...allTimestamps);
    const endTime = Math.max(...allTimestamps);

    const componentRawResults = componentResult.results
      .flatMap((adapterResult: AdapterResult) => {
        switch (adapterResult.type) {
          case "cliff":
            const cliffResult = adapterResult as CliffAdapterResult;
            return {
              timestamp:
                typeof cliffResult.start === "string"
                  ? new Date(cliffResult.start).getTime() / 1000
                  : cliffResult.start,
              change: cliffResult.amount,
            };
          case "linear":
            const linearResult = adapterResult as LinearAdapterResult;
            return {
              timestamp:
                typeof linearResult.start === "string"
                  ? new Date(linearResult.start).getTime() / 1000
                  : linearResult.start,
              change: linearResult.amount,
              continuousEnd:
                typeof linearResult.end === "string"
                  ? new Date(linearResult.end).getTime() / 1000
                  : linearResult.end,
            };
          case "step":
            const stepResult = adapterResult as StepAdapterResult;
            const stepResults = [];
            // Use same logic as V1's stepAdapterToRaw()
            const startTimestamp = typeof stepResult.start === "string"
              ? new Date(stepResult.start).getTime() / 1000
              : stepResult.start;
            const duration = typeof stepResult.stepDuration === "string"
              ? new Date(stepResult.stepDuration).getTime() / 1000
              : stepResult.stepDuration;

            for (let i = 0; i < stepResult.steps; i++) {
              stepResults.push({
                timestamp: startTimestamp + (i + 1) * duration,
                change: stepResult.amount, // amount is per step, not total
              });
            }
            return stepResults;
          default:
            return [];
        }
      })
      .flat();

    let combinedChartData = {
      timestamps: [] as number[],
      unlocked: [] as number[],
      rawEmission: [] as number[],
      burned: [] as number[],
      isContinuous: false,
    };

    if (componentRawResults.length > 0) {
      const chartDataResults = componentRawResults.map((rawResult: any) =>
        rawToChartData("", rawResult, startTime, endTime),
      );

      if (chartDataResults.length > 0) {
        combinedChartData = chartDataResults[0];

        for (let i = 1; i < chartDataResults.length; i++) {
          const chartData = chartDataResults[i];
          for (
            let j = 0;
            j < combinedChartData.unlocked.length &&
            j < chartData.unlocked.length;
            j++
          ) {
            combinedChartData.unlocked[j] += chartData.unlocked[j];
            combinedChartData.rawEmission[j] += chartData.rawEmission[j];
            combinedChartData.burned[j] += chartData.burned[j];
          }
        }
      }
    }

    return {
      section: section.sectionName,
      component: componentResult.component.id,
      name: componentResult.component.name,
      data: combinedChartData,
      flags: componentResult.flags,
      metadata: {
        methodology: componentResult.component.methodology,
        ...componentResult.component.metadata,
      },
    };
  }

  static generateColorVariants(
    baseSectionColors: { [key: string]: string },
    sectionName: string,
    componentCount: number,
  ): string[] {
    const baseColor = baseSectionColors[sectionName] || "#808080";
    const colors: string[] = [];

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const rgbToHex = (r: number, g: number, b: number) => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    const rgb = hexToRgb(baseColor);
    if (!rgb) return Array(componentCount).fill(baseColor);

    for (let i = 0; i < componentCount; i++) {
      const factor = 1 - i * 0.15;
      const adjustedR = Math.max(0, Math.min(255, Math.floor(rgb.r * factor)));
      const adjustedG = Math.max(0, Math.min(255, Math.floor(rgb.g * factor)));
      const adjustedB = Math.max(0, Math.min(255, Math.floor(rgb.b * factor)));

      colors.push(rgbToHex(adjustedR, adjustedG, adjustedB));
    }

    return colors;
  }

  static generateTemplateData(
    sectionChartData: ChartSection[],
    v2ChartData?: ChartDataV2,
    protocolName?: string,
  ): any {
    const baseSectionColors: { [key: string]: string } = {
      "Farming Rewards": "#008000",
      "Liquidity Rewards": "#0000FF",
      Airdrop: "#00FFFF",
      Treasury: "#4B0082",
      Team: "#696969",
      Advisors: "#800000",
      "Public Sale": "#800080",
    };

    const sectionData = sectionChartData.map((section, index) => ({
      label: section.section,
      data: section.data.unlocked.map((value, i) => ({
        x: new Date(section.data.timestamps[i] * 1000),
        y: value,
      })),
      borderColor:
        baseSectionColors[section.section] ||
        Object.values(baseSectionColors)[
          index % Object.values(baseSectionColors).length
        ],
      backgroundColor:
        baseSectionColors[section.section] ||
        Object.values(baseSectionColors)[
          index % Object.values(baseSectionColors).length
        ],
      fill: true,
      borderWidth: 2,
      tension: 0.1,
      datasetType: "section",
    }));

    let componentData: any[] = [];
    let supplyMetrics: AdjustedSupplyMetrics | undefined;

    if (v2ChartData?.components) {
      const sectionComponentMap: Record<string, ComponentChartData[]> = {};

      for (const component of v2ChartData.components) {
        if (!sectionComponentMap[component.section]) {
          sectionComponentMap[component.section] = [];
        }
        sectionComponentMap[component.section].push(component);
      }

      for (const [sectionName, components] of Object.entries(
        sectionComponentMap,
      )) {
        const colors = V2ChartGenerator.generateColorVariants(
          baseSectionColors,
          sectionName,
          components.length,
        );

        components.forEach((component, index) => {
          componentData.push({
            label: `${component.section} → ${component.name}`,
            data: component.data.unlocked.map((value, i) => ({
              x: new Date(component.data.timestamps[i] * 1000),
              y: value,
            })),
            borderColor: colors[index],
            backgroundColor: colors[index] + "40",
            fill: false,
            borderWidth: 1,
            tension: 0.1,
            datasetType: "component",
            section: component.section,
            componentId: component.component,
            flags: component.flags,
            metadata: component.metadata,
            hidden: true,
          });
        });
      }

      supplyMetrics = v2ChartData.supplyMetrics;
    }

    return {
      sections: sectionData,
      components: componentData,
      supplyMetrics,
      protocolName: protocolName || "Unknown Protocol",
      isV2: !!v2ChartData?.components,
    };
  }
}

export default V2ChartGenerator;
