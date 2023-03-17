import adapters from "./../protocols";
import { Protocol } from "../types/adapters";
import { createChartData } from "./convertToChartData";
import { createRawSections } from "./convertToRawData";
import { getChartPng } from "./chart";

if (process.argv.length < 3) {
  console.error(`Missing argument, you need to provide the adapter name.
    Eg: ts-node defi/src/emissions/utils/test.ts aave`);
  process.exit(1);
}
let protocol = process.argv[2];

export async function parseData(adapter: Protocol): Promise<void> {
  const { rawSections, startTime, endTime } = await createRawSections(adapter);
  const data = createChartData(rawSections, startTime, endTime);
  await getChartPng(data);
}

export async function main() {
  if (protocol.includes("/"))
    protocol = protocol.substring(
      protocol.lastIndexOf("/") + 1,
      protocol.lastIndexOf(".ts"),
    );
  console.log(`entering with '${protocol}'`);

  try {
    const protocolWrapper = (adapters as any)[protocol];
    if (!protocolWrapper) {
      console.log(
        `The passed protocol name is invalid. Make sure '${protocol}' is a key of './adapters/index.ts'`,
      );
      return;
    }
    console.log(`==== Drawing ${protocol} chart ====`);
    await parseData(protocolWrapper);
    return "Hi this is a test";
  } catch {}
}
main();
