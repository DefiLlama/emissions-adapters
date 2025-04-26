import 'dotenv/config';

import { Allocations, Protocol } from "../types/adapters";
import { createChartData } from "./convertToChartData";
import { createRawSections } from "./convertToRawData";
import { createCategoryData } from "./categoryData";
import { getChartPng } from "./chart";
import fs from 'fs';
import path from 'path';
import { secondsToReadableDate } from "./time";
import * as _env from './env'

// to trigger inclusion of the env.ts file
const _include_env = _env.getEnv('BITLAYER_RPC')

if (process.argv.length < 3) {
  console.error(`Missing argument, you need to provide the adapter name.
    Eg: npm test aave`);
  process.exit(1);
}
let protocol = process.argv[2];

export async function parseData(adapter: Protocol, i: number): Promise<void> {
  let rawData = await createRawSections(adapter);
  const { realTimeData, documentedData } = await createChartData(
    protocol,
    rawData,
    adapter.documented?.replaces ?? [],
  );

  const categoryData = createCategoryData(realTimeData, rawData.categories);
  const documentedCategoryData = createCategoryData(
    documentedData,
    rawData.categories,
  );

  if (process.argv[3] != "true")
    postDebugLogs(realTimeData, categoryData, protocol, documentedCategoryData);

  await Promise.all([
    getChartPng(realTimeData, process.argv[3] == "true", i),
    documentedData.length
      ? getChartPng(documentedData, process.argv[3] == "true", i + 0.5)
      : [],
  ]);

  await generateInteractiveChart(realTimeData, protocol, i);
  if (documentedData.length) {
    await generateInteractiveChart(documentedData, protocol, i + 0.5);
  }
}

function postDebugLogs(
  data: any[],
  categoryData: { [categories: string]: Allocations },
  protocol: string,
  documentedCategoryData: { [categories: string]: Allocations },
): void {
  const format: string = "DD/MM/YY";
  let sum: number = 0;
  let totalSupply: number = 0;

  if (data[0]?.metadata?.total) {
    totalSupply = data[0].metadata.total;
  }

  console.log(
    `The ${protocol} chart produced starts on ${secondsToReadableDate(
      data[0].data.timestamps[0],
      format,
    )} and ends on ${secondsToReadableDate(
      data[0].data.timestamps.at(-1),
      format,
    )} (dates in format ${format})`,
  );

  data.map((s: any) => {
    sum += s.data.unlocked.at(-1);
    console.log(
      `${s.section} emissions total ${s.data.unlocked.at(-1).toFixed()}`,
    );
  });
  console.log(`for an overall of ${sum} tokens emitted \n`);

  Object.keys(categoryData).map((time: string) => {
    let log: string = `${time} category allocations:\t`;
    Object.keys(categoryData[time]).map((c: string) => {
      log += `${categoryData[time][c]}% ${c}\t`;
    });
    console.log(log);
  });

  Object.keys(documentedCategoryData).map((time: string) => {
    let log: string = `${time} documented category allocations:\t`;
    Object.keys(documentedCategoryData[time]).map((c: string) => {
      log += `${documentedCategoryData[time][c]}% ${c}\t`;
    });
    console.log(log);
  });
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
  if (protocol.includes("/"))
    protocol = protocol.substring(
      protocol.lastIndexOf("/") + 1,
      protocol.lastIndexOf(".ts"),
    );
  try {
    let protocolWrapper = await import(`../protocols/${protocol}`);
    if (!protocolWrapper && process.argv[3] == "true") {
      return;
    } else {
      console.log(`==== Processing ${protocol} chart ==== \n`);
      await iterate(protocolWrapper);
    }
  } catch (e) {
    console.log(e);
  }
}
async function generateInteractiveChart(data: any[], protocolName: string, index: number) {
  const templatePath = path.join(__dirname, 'template.html');
  const outputPath = path.join(__dirname, 'testCharts', `result${index}.html`);
  
  let template = fs.readFileSync(templatePath, 'utf8');
  
  template = template.replace(
    'const chartData = CHART_DATA_PLACEHOLDER;',
    `const chartData = ${JSON.stringify(data, null, 2)};`
  );
  
  template = template.replace(
    '<h1>Protocol Emissions Chart</h1>',
    `<h1>${protocolName} Emissions Chart</h1>`
  );
  
  fs.writeFileSync(outputPath, template);
  
  console.log(`Interactive chart generated at ${outputPath}`);
}

main();
