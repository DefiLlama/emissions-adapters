import { Protocol } from "../types/adapters";
import { createChartData } from "./convertToChartData";
import { createRawSections } from "./convertToRawData";
import { getChartPng } from "./chart";

if (process.argv.length < 3) {
  console.error(`Missing argument, you need to provide the adapter name.
    Eg: ts-node utils/test.ts aave`);
  process.exit(1);
}
let protocol = process.argv[2];

export async function parseData(adapter: Protocol): Promise<void> {
  const { rawSections, startTime, endTime } = await createRawSections(adapter);
  const data = createChartData(rawSections, startTime, endTime);
  await getChartPng(data, process.argv[3] == 'true');
}

export async function main() {
  if (protocol.includes("/"))
    protocol = protocol.substring(
      protocol.lastIndexOf("/") + 1,
      protocol.lastIndexOf(".ts"),
    );
  try {
    const protocolWrapper = await import(`../protocols/${protocol}`);
    if (!protocolWrapper && process.argv[3] == 'true') {
      return 
    } else {
      console.log(`==== Drawing ${protocol} chart ====`);
      await parseData(protocolWrapper);
    }
  } catch(e) {
    console.log(e)
  }
}
main();
