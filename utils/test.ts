import "dotenv/config";

import {
  Allocations,
  Protocol,
  isProtocolV2,
  ProtocolV2,
  ProcessedProtocolV2,
} from "../types/adapters";
import { createChartData } from "./convertToChartData";
import { createRawSections } from "./convertToRawData";
import { createCategoryData } from "./categoryData";
import { getChartPng } from "./chart";
import fs from "fs";
import path from "path";
import { secondsToReadableDate } from "./time";
import * as _env from "./env";
import { V2Processor } from "./v2-processor";
import { V2ChartGenerator } from "./v2-chart-generator";

const _include_env = _env.getEnv("BITLAYER_RPC");

if (process.argv.length < 3) {
  console.error(`Missing argument, you need to provide the adapter name.
    Eg: npm test aave`);
  process.exit(1);
}
let protocol = process.argv[2];

export async function parseData(adapter: Protocol, i: number): Promise<void> {
  let v2ProcessedData: ProcessedProtocolV2 | undefined;
  let v1SupplyMetrics: any = undefined;

  if (isProtocolV2(adapter)) {
    try {
      v2ProcessedData = await V2Processor.processV2Protocol(
        adapter as ProtocolV2,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log(`processing failed: ${errorMessage}`);
      throw error;
    }
  }

  let rawData = await createRawSections(adapter);
  const replaces = (adapter as any).documented?.replaces ?? [];
  
  if (!isProtocolV2(adapter)) {
    try {
      v1SupplyMetrics = await V2Processor.calculateAdjustedSupplyMetrics(
        [],
        adapter as any, // V1 adapter cast to ProtocolV2
        rawData.categories,
      );
    } catch (error) {
      console.warn("Could not calculate supply metrics for V1 adapter");
    }
  }
  
  const { realTimeData, documentedData } = await createChartData(
    protocol,
    rawData,
    replaces,
  );

  const categoryData = createCategoryData(realTimeData, rawData.categories);
  const documentedCategoryData = createCategoryData(
    documentedData,
    rawData.categories,
  );

  if (process.argv[3] != "true") {
    if (v2ProcessedData) {
      postV2DebugLogs(
        realTimeData,
        categoryData,
        protocol,
        documentedCategoryData,
        v2ProcessedData,
        rawData.metadata,
      );
    } else {
      postDebugLogs(
        realTimeData,
        categoryData,
        protocol,
        documentedCategoryData,
        rawData.metadata,
        v1SupplyMetrics,
        rawData.categories,
      );
    }
  }

  await Promise.all([
    getChartPng(realTimeData, process.argv[3] == "true", i),
    documentedData.length
      ? getChartPng(documentedData, process.argv[3] == "true", i + 0.5)
      : [],
  ]);

  if (v2ProcessedData) {
    await generateV2InteractiveChart(
      realTimeData,
      protocol,
      i,
      v2ProcessedData,
    );
    if (documentedData.length) {
      await generateV2InteractiveChart(
        documentedData,
        protocol,
        i + 0.5,
        v2ProcessedData,
      );
    }
  } else {
    await generateInteractiveChart(realTimeData, protocol, i);
    if (documentedData.length) {
      await generateInteractiveChart(documentedData, protocol, i + 0.5);
    }
  }
}

function printCategoryAllocations(
  categoryData: { [categories: string]: Allocations },
  type: string,
) {
  Object.keys(categoryData).forEach((time: string) => {
    let log = `${time} ${type} allocations: `;
    Object.keys(categoryData[time]).forEach((c: string) => {
      log += `${categoryData[time][c]}% ${c} `;
    });
    console.log(log.trim());
  });
}

function calculateCirculationStatus(data: any[], supplyMetrics: any, categories: any): string {
  if (!supplyMetrics || !supplyMetrics.maxSupply || supplyMetrics.maxSupply === 0) {
    return "Circulation Status: Unable to calculate (missing supply data)";
  }

  const todayTimestamp = Math.floor(Date.now() / 1000);
  let totalNonTBDUnlocked = 0;
  let totalTBDAmount = 0;
  let totalNonTBDFuture = 0;

  data.forEach(section => {
    if (!section.data?.timestamps || !section.data?.unlocked) return;
    
    const sectionName = section.section;
    
    const isTBDSection = categories?.noncirculating?.includes(sectionName) || false;
    
    const timestamps = section.data.timestamps;
    const unlocked = section.data.unlocked;
    
    let todayIndex = -1;
    for (let i = timestamps.length - 1; i >= 0; i--) {
      if (timestamps[i] <= todayTimestamp) {
        todayIndex = i;
        break;
      }
    }
    
    const todayUnlocked = todayIndex >= 0 ? unlocked[todayIndex] : 0;
    const totalSectionAmount = unlocked[unlocked.length - 1]; // Final amount
    
    if (isTBDSection) {
      totalTBDAmount += totalSectionAmount;
    } else {
      totalNonTBDUnlocked += todayUnlocked;
      totalNonTBDFuture += (totalSectionAmount - todayUnlocked);
    }
  });

  const maxSupply = supplyMetrics.maxSupply;
  
  const unlockedPercent = (totalNonTBDUnlocked / maxSupply) * 100;
  const tbdPercent = (totalTBDAmount / maxSupply) * 100;
  const notUnlockedPercent = (totalNonTBDFuture / maxSupply) * 100;

  return `Circulation Status: ${unlockedPercent.toFixed(1)}% Unlocked, ${notUnlockedPercent.toFixed(1)}% Not Unlocked, ${tbdPercent.toFixed(1)}% TBD`;
}

function postDebugLogs(
  data: any[],
  categoryData: { [categories: string]: Allocations },
  protocol: string,
  documentedCategoryData: { [categories: string]: Allocations },
  metadata: any,
  supplyMetrics?: any,
  categories?: any,
): void {
  const format = "DD/MM/YY";
  let sum = 0;

  console.log(`${protocol} Analysis`);
  console.log(
    `Chart range: ${secondsToReadableDate(
      data[0].data.timestamps[0],
      format,
    )} to ${secondsToReadableDate(data[0].data.timestamps.at(-1), format)}`,
  );

  data.forEach((s: any) => {
    sum += s.data.unlocked.at(-1);
    console.log(`${s.section}: ${s.data.unlocked.at(-1).toFixed()} tokens`);
  });
  console.log(`Total emissions: ${sum} tokens\n`);

  if (metadata?.events && metadata.events.length > 0) {
    console.log(`Timeline Events (${metadata.events.length} total):`);
    metadata.events.slice(0, 10).forEach((event: any) => {
      const date = new Date(event.timestamp * 1000).toLocaleDateString();
      console.log(`  - ${date}: ${event.description}`);
    });
    if (metadata.events.length > 10) {
      console.log(`  ... and ${metadata.events.length - 10} more events`);
    }
    console.log("");
  } else {
    console.log(`No timeline events generated\n`);
  }

  if (supplyMetrics) {
    console.log(`Supply metrics:`);
    console.log(`  Max Supply: ${supplyMetrics.maxSupply.toLocaleString()}`);
    console.log(`  Adjusted Supply: ${supplyMetrics.adjustedSupply.toLocaleString()}`);
    console.log(`  TBD Amount: ${supplyMetrics.tbdAmount.toLocaleString()}`);
    console.log(
      `  Incentive Amount: ${supplyMetrics.incentiveAmount.toLocaleString()}`,
    );
    console.log(
      `  Non-Incentive Amount: ${supplyMetrics.nonIncentiveAmount.toLocaleString()}`,
    );
    console.log(`  ${calculateCirculationStatus(data, supplyMetrics, categories)}\n`);
  }

  printCategoryAllocations(categoryData, "category");
  printCategoryAllocations(documentedCategoryData, "documented category");
}
async function iterate(adapter: Protocol): Promise<void> {
  if (typeof adapter.default === "function")
    adapter.default = await adapter.default();
  if (!adapter.default.length) adapter.default = [adapter.default];
  await Promise.all(
    adapter.default.map((a: Protocol, i: number) => parseData(a, i)),
  );
}
export async function main() {
  if (protocol.includes("/")) {
    protocol = protocol.substring(
      protocol.lastIndexOf("/") + 1,
      protocol.lastIndexOf(".ts"),
    );
  }

  try {
    const protocolWrapper = await import(`../protocols/${protocol}`);
    if (!protocolWrapper && process.argv[3] === "true") {
      return;
    }

    console.log(`Processing ${protocol} chart\n`);
    await iterate(protocolWrapper);
  } catch (e) {
    console.log(e);
  }
}
function postV2DebugLogs(
  data: any[],
  categoryData: { [categories: string]: Allocations },
  _protocol: string,
  documentedCategoryData: { [categories: string]: Allocations },
  v2Data: ProcessedProtocolV2,
  metadata: any,
): void {
  const format = "DD/MM/YY";
  let sum = 0;

  console.log(
    `Chart range: ${secondsToReadableDate(
      data[0].data.timestamps[0],
      format,
    )} to ${secondsToReadableDate(data[0].data.timestamps.at(-1), format)}\n`,
  );

  console.log(`Section totals:`);
  data.forEach((s: any) => {
    sum += s.data.unlocked.at(-1);
    console.log(`  ${s.section}: ${s.data.unlocked.at(-1).toFixed()} tokens`);
  });

  console.log(`\nComponent breakdown:`);
  const componentBreakdown = V2Processor.getComponentBreakdown(v2Data.sections);

  for (const [sectionName, sectionData] of Object.entries(componentBreakdown)) {
    const section = sectionData as any;
    console.log(`  ${sectionName} (${section.sectionTotal.toFixed()} tokens)`);
    console.log(
      `    Incentives: ${section.hasIncentives ? "Yes" : "No"}, TBD: ${section.hasTBD ? "Yes" : "No"}`,
    );

    Object.entries(section.components).forEach(
      ([, componentData]: [string, any]) => {
        const flags = [];
        if (componentData.flags.isIncentive) flags.push("incentive");
        if (componentData.flags.isTBD) flags.push("TBD");

        const flagStr = flags.length > 0 ? ` (${flags.join(", ")})` : "";
        console.log(
          `    - ${componentData.name}: ${componentData.total.toFixed()} tokens${flagStr}`,
        );
      },
    );
  }

  console.log(`\nTotal emissions: ${sum} tokens\n`);

  const metrics = v2Data.supplyMetrics;
  console.log(`Supply metrics:`);
  console.log(`  Max Supply: ${metrics.maxSupply.toLocaleString()}`);
  console.log(`  Adjusted Supply: ${metrics.adjustedSupply.toLocaleString()}`);
  console.log(`  TBD Amount: ${metrics.tbdAmount.toLocaleString()}`);
  console.log(
    `  Incentive Amount: ${metrics.incentiveAmount.toLocaleString()}`,
  );
  console.log(
    `  Non-Incentive Amount: ${metrics.nonIncentiveAmount.toLocaleString()}`,
  );
  console.log(`  ${calculateCirculationStatus(data, metrics, v2Data.protocol.categories)}\n`);
  if (metadata?.events && metadata.events.length > 0) {
    console.log(`Timeline Events (${metadata.events.length} total):`);
    metadata.events.slice(0, 10).forEach((event: any) => {
      const date = new Date(event.timestamp * 1000).toLocaleDateString();
      console.log(`  - ${date}: ${event.description}`);
    });
    if (metadata.events.length > 10) {
      console.log(`  ... and ${metadata.events.length - 10} more events`);
    }
    console.log("");
  } else {
    console.log(`No timeline events generated\n`);
  }

  printCategoryAllocations(categoryData, "category");
  printCategoryAllocations(documentedCategoryData, "documented category");
}

async function generateInteractiveChart(
  data: any[],
  protocolName: string,
  index: number,
) {
  const templatePath = path.join(__dirname, "template.html");
  const outputPath = path.join(__dirname, "testCharts", `result${index}.html`);

  let template = fs.readFileSync(templatePath, "utf8");

  template = template.replace(
    "const chartData = CHART_DATA_PLACEHOLDER;",
    `const chartData = ${JSON.stringify(data, null, 2)};`,
  );

  template = template.replace(
    "<h1>Protocol Emissions Chart</h1>",
    `<h1>${protocolName} Emissions Chart</h1>`,
  );

  fs.writeFileSync(outputPath, template);

  console.log(`Interactive chart generated at ${outputPath}`);
}

async function generateV2InteractiveChart(
  data: any[],
  protocolName: string,
  index: number,
  v2Data: ProcessedProtocolV2,
) {
  const templatePath = path.join(__dirname, "template-v2.html");
  const outputPath = path.join(__dirname, "testCharts", `result${index}.html`);

  const v2ChartData = V2ChartGenerator.generateV2ChartData(v2Data, data);
  const templateData = V2ChartGenerator.generateTemplateData(
    data,
    v2ChartData,
    protocolName,
  );

  let template = fs.readFileSync(templatePath, "utf8");

  template = template.replace(
    "const chartConfig = CHART_DATA_PLACEHOLDER;",
    `const chartConfig = ${JSON.stringify(templateData, null, 2)};`,
  );

  fs.writeFileSync(outputPath, template);

  console.log(
    `Interactive V2 chart with component breakdown generated at ${outputPath}`,
  );

  const componentOutputPath = path.join(
    __dirname,
    "testCharts",
    `result${index}-components.html`,
  );

  let componentTemplate = template
    .replace(`currentView = 'section'`, `currentView = 'component'`)
    .replace(
      'class="toggle-btn active">Section View',
      'class="toggle-btn">Section View',
    )
    .replace(
      'class="toggle-btn">Component View',
      'class="toggle-btn active">Component View',
    );

  fs.writeFileSync(componentOutputPath, componentTemplate);

  console.log(`Component-focused chart generated at ${componentOutputPath}`);
}

main();
