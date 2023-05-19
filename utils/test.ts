import { Protocol } from "../types/adapters";
import { createChartData } from "./convertToChartData";
import { createRawSections } from "./convertToRawData";
import { getChartPng } from "./chart";
import { secondsToReadableDate } from "./time";

if (process.argv.length < 3) {
  console.error(`Missing argument, you need to provide the adapter name.
    Eg: ts-node utils/test.ts aave`);
  process.exit(1);
}
let protocol = process.argv[2];

export async function parseData(adapter: Protocol): Promise<void> {
  let rawData = await createRawSections(adapter);
  const chartData = await createChartData(protocol, rawData);
  if (process.argv[3] != "true") postDebugLogs(chartData, protocol);
  await getChartPng(chartData, process.argv[3] == "true");
}

function postDebugLogs(data: any[], protocol: string): void {
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
  console.log(`for an overall of ${sum} tokens emitted`);
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
      await parseData(protocolWrapper);
    }
  } catch (e) {
    console.log(e);
  }
}
main();
