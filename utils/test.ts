import { Allocations, Protocol } from "../types/adapters";
import { createChartData } from "./convertToChartData";
import { createRawSections } from "./convertToRawData";
import { createCategoryData } from "./categoryData";
import { getChartPng } from "./chart";
import { secondsToReadableDate } from "./time";

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
  );

  const categoryData = createCategoryData(
    realTimeData,
    rawData.categories,
    true,
  );
  const documentedCategoryData = documentedData.length
    ? createCategoryData(
        realTimeData,
        rawData.categories,
        true,
        documentedData,
        adapter.documented?.replaces,
      )
    : {};

  if (process.argv[3] != "true")
    postDebugLogs(realTimeData, categoryData, protocol, documentedCategoryData);

  await Promise.all([
    getChartPng(realTimeData, process.argv[3] == "true", i),
    documentedData.length
      ? getChartPng(documentedData, process.argv[3] == "true", i + 0.5)
      : [],
  ]);
}

function postDebugLogs(
  data: any[],
  categoryData: { [categories: string]: Allocations },
  protocol: string,
  documentedCategoryData: { [categories: string]: Allocations },
): void {
  const format: string = "DD/MM/YY";
  let sum: number = 0;

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
main();
