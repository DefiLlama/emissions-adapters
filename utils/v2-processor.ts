import {
  ProtocolV2,
  SectionV2,
  ComponentResult,
  ProcessedSectionV2,
  ProcessedProtocolV2,
  AdjustedSupplyMetrics,
  AdapterResult,
  isSectionV2,
} from "../types/adapters";

export class V2Processor {
  static async processV2Protocol(
    protocol: ProtocolV2,
    backfill?: boolean,
  ): Promise<ProcessedProtocolV2> {
    const sections: ProcessedSectionV2[] = [];

    for (const [sectionName, section] of Object.entries(protocol)) {
      if (
        sectionName === "meta" ||
        sectionName === "categories" ||
        sectionName === "documented"
      ) {
        continue;
      }

      if (isSectionV2(section)) {
        try {
          const processedSection = await V2Processor.processV2Section(
            sectionName,
            section as SectionV2,
            backfill,
          );
          sections.push(processedSection);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          throw new Error(`Section '${sectionName}' failed: ${errorMessage}`);
        }
      } else {
        console.log(`v1 section in v2 adapter: ${sectionName}`);
      }
    }

    return {
      protocol,
      sections,
      supplyMetrics: {
        maxSupply: 0,
        adjustedSupply: 0,
        tbdAmount: 0,
        incentiveAmount: 0,
        nonIncentiveAmount: 0,
      }, // Will be recalculated later with chart data
    };
  }
  static async processV2Section(
    sectionName: string,
    section: SectionV2,
    backfill?: boolean,
  ): Promise<ProcessedSectionV2> {
    const componentResults: ComponentResult[] = [];
    let hasIncentives = false;
    let hasTBD = false;

    for (const component of section.components) {
      try {
        const results = await component.fetch(backfill);

        const effectiveFlags = {
          isIncentive: component.isIncentive ?? section.isIncentive ?? false,
          isTBD: component.isTBD ?? section.isTBD ?? false,
          protocols: component.protocols ?? section.protocols,
        };

        const processedResults = effectiveFlags.isTBD
          ? V2Processor.transformTBDDates(results)
          : results;

        if (effectiveFlags.isIncentive) hasIncentives = true;
        if (effectiveFlags.isTBD) hasTBD = true;

        const componentResult: ComponentResult = {
          component,
          results: processedResults,
          flags: effectiveFlags,
        };

        componentResults.push(componentResult);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `error, '${component.id}' failed:`,
          errorMessage,
        );
        throw new Error(
          `error, '${component.id}' in section '${sectionName}' failed: ${errorMessage}`,
        );
      }
    }

    const aggregatedResults =
      V2Processor.aggregateComponentResults(componentResults);

    const processedSection: ProcessedSectionV2 = {
      sectionName,
      section,
      components: componentResults,
      aggregatedResults,
      hasIncentives,
      hasTBD,
    };

    return processedSection;
  }

  static transformTBDDates(results: AdapterResult[]): AdapterResult[] {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = Math.floor(tomorrow.getTime() / 1000);

    return results.map((result) => ({
      ...result,
      start: tomorrowTimestamp,
      end: result.type === "cliff" ? tomorrowTimestamp : result.end,
    }));
  }

  static aggregateComponentResults(
    componentResults: ComponentResult[],
  ): AdapterResult[] {
    const aggregated: AdapterResult[] = [];

    for (const componentResult of componentResults) {
      aggregated.push(...componentResult.results);
    }

    return aggregated;
  }

  static async calculateAdjustedSupplyMetrics(
    sections: ProcessedSectionV2[],
    fullProtocol: ProtocolV2,
    categories: any,
    chartData?: any[],
  ): Promise<AdjustedSupplyMetrics> {
    let maxSupply = 0;
    let tbdAmount = 0;
    let incentiveAmount = 0;
    let excludedAmount = 0;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Helper function to find unlocked amount at current time from chart data
    const getUnlockedAmountFromChart = (sectionName: string): number => {
      if (!chartData) return 0;
      
      const sectionChart = chartData.find(chart => chart.section === sectionName);
      if (!sectionChart?.data?.timestamps || !sectionChart?.data?.unlocked) return 0;
      
      const timestamps = sectionChart.data.timestamps;
      const unlocked = sectionChart.data.unlocked;
      
      // Find the latest timestamp <= currentTimestamp
      let todayIndex = -1;
      for (let i = timestamps.length - 1; i >= 0; i--) {
        if (timestamps[i] <= currentTimestamp) {
          todayIndex = i;
          break;
        }
      }
      
      return todayIndex >= 0 ? unlocked[todayIndex] : 0;
    };

    for (const section of sections) {
      const sectionTotal = section.aggregatedResults.reduce(
        (sum, result) => {
          const totalAmount = result.type === "step" 
            ? result.amount * (result as any).steps 
            : result.amount;
          return sum + totalAmount;
        },
        0,
      );
      maxSupply += sectionTotal;

      for (const componentResult of section.components) {
        const componentTotal = componentResult.results.reduce(
          (sum, result) => {
            const totalAmount = result.type === "step" 
              ? result.amount * (result as any).steps 
              : result.amount;
            return sum + totalAmount;
          },
          0,
        );

        if (componentResult.flags.isTBD) {
          // Use time-adjusted TBD: total - unlocked at current time
          const unlockedAmount = getUnlockedAmountFromChart(section.sectionName);
          tbdAmount += (componentTotal - unlockedAmount);
        }

        if (componentResult.flags.isIncentive) {
          incentiveAmount += componentTotal;
        }
      }
    }

    for (const [sectionName, section] of Object.entries(fullProtocol)) {
      if (
        sectionName === "meta" ||
        sectionName === "categories" ||
        sectionName === "documented" ||
        isSectionV2(section)
      ) {
        continue;
      }

      let v1Results: AdapterResult[] = [];

      if (typeof section === "function") {
        try {
          const result = await section();
          v1Results = Array.isArray(result) ? result : [result];
        } catch (error) {
          console.warn(
            `error could not process ${sectionName} for supply metrics`,
          );
          continue;
        }
      } else if (Array.isArray(section)) {
        // Handle mixed arrays containing both AdapterResults and functions
        try {
          for (const item of section) {
            if (typeof item === "function") {
              const result = await item();
              if (Array.isArray(result)) {
                v1Results.push(...result);
              } else {
                v1Results.push(result);
              }
            } else {
              v1Results.push(item as AdapterResult);
            }
          }
        } catch (error) {
          console.warn(
            `error could not process array section ${sectionName} for supply metrics`,
          );
          continue;
        }
      } else {
        v1Results = [section as AdapterResult];
      }

      const v1SectionTotal = v1Results.reduce(
        (sum, result) => {
          const totalAmount = result.type === "step" 
            ? result.amount * (result as any).steps 
            : result.amount;
          return sum + totalAmount;
        },
        0,
      );
      maxSupply += v1SectionTotal;

      const categoryKeys = Object.keys(categories);
      const sectionCategory = categoryKeys.find((cat) =>
        categories[cat].includes(sectionName),
      );

      const excludeFromAdjusted = (fullProtocol.meta as any).excludeFromAdjustedSupply || [];
      const isV1Incentive = sectionCategory === "farming";
      const isV1Excluded = excludeFromAdjusted.includes(sectionName);
      const isV1TBD = sectionCategory === "noncirculating";

      if (isV1Incentive || isV1Excluded) {
        incentiveAmount += v1SectionTotal;
      }

      if (isV1Excluded) {
        excludedAmount += v1SectionTotal;
      }

      if (isV1TBD) {
        // Use time-adjusted TBD: total - unlocked at current time
        const unlockedAmount = getUnlockedAmountFromChart(sectionName);
        tbdAmount += (v1SectionTotal - unlockedAmount);
      }
    }

    const adjustedSupply = maxSupply - tbdAmount - excludedAmount;
    const nonIncentiveAmount = maxSupply - incentiveAmount;

    return {
      maxSupply,
      adjustedSupply,
      tbdAmount,
      incentiveAmount,
      nonIncentiveAmount,
    };
  }

  static validateV2Adapter(adapter: ProtocolV2): string[] {
    const errors: string[] = [];

    if (!adapter.meta?.version || adapter.meta.version !== 2) {
      errors.push("Missing or invalid meta.version field - must be 2");
    }

    if (!adapter.meta?.token) {
      errors.push("Missing meta.token field");
    }

    if (!adapter.categories) {
      errors.push("Missing categories field");
    }

    Object.entries(adapter).forEach(([sectionName, section]) => {
      if (
        sectionName === "meta" ||
        sectionName === "categories" ||
        sectionName === "documented"
      ) {
        return;
      }

      if (isSectionV2(section)) {
        const sectionV2 = section as SectionV2;

        if (!sectionV2.components?.length) {
          errors.push(`V2 section '${sectionName}' has no components`);
        }

        sectionV2.components?.forEach((component, index) => {
          if (!component.id) {
            errors.push(
              `Component ${index} in section '${sectionName}' missing id`,
            );
          }

          if (!component.name) {
            errors.push(
              `Component '${component.id}' in section '${sectionName}' missing name`,
            );
          }

          if (!component.fetch || typeof component.fetch !== "function") {
            errors.push(
              `Component '${component.id}' in section '${sectionName}' missing or invalid fetch function`,
            );
          }

          const duplicateIds = sectionV2.components.filter(
            (c) => c.id === component.id,
          );
          if (duplicateIds.length > 1) {
            errors.push(
              `Duplicate component id '${component.id}' in section '${sectionName}'`,
            );
          }
        });
      }
    });

    return errors;
  }

  static getComponentBreakdown(
    sections: ProcessedSectionV2[],
  ): Record<string, any> {
    const breakdown: Record<string, any> = {};

    for (const section of sections) {
      const sectionBreakdown = {
        sectionTotal: section.aggregatedResults.reduce(
          (sum, result) => {
            const totalAmount = result.type === "step" 
              ? result.amount * (result as any).steps 
              : result.amount;
            return sum + totalAmount;
          },
          0,
        ),
        hasIncentives: section.hasIncentives,
        hasTBD: section.hasTBD,
        components: {} as Record<string, any>,
      };

      for (const componentResult of section.components) {
        const componentTotal = componentResult.results.reduce(
          (sum, result) => {
            const totalAmount = result.type === "step" 
              ? result.amount * (result as any).steps 
              : result.amount;
            return sum + totalAmount;
          },
          0,
        );

        sectionBreakdown.components[componentResult.component.id] = {
          name: componentResult.component.name,
          total: componentTotal,
          flags: componentResult.flags,
          methodology: componentResult.component.methodology,
          resultCount: componentResult.results.length,
        };
      }

      breakdown[section.sectionName] = sectionBreakdown;
    }

    return breakdown;
  }
}

export default V2Processor;
