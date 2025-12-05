import { PromisePool } from "@supercharge/promise-pool";
import { EmissionBreakdown, Protocol } from "../types/adapters";
import { storeR2JSONString } from "./r2";
import { sendMessage, withTimeout } from "./serverUtils";
import { init, processSingleProtocol } from "./utils";
import { readdirSync } from "fs";

const duplicateIds: string[] = [
  '1048' // merit circle, beam
];

async function validateAdapters(emissionsAdapters: any) {
  const errors = [] as string[];
  const tokens = new Set<string>(), protocolIds = new Set<string>(), notes = new Set<string>(), sources = new Set<string>();
  for (const [protocolName, protocolFile] of Object.entries(emissionsAdapters)) {
    try {

      if (protocolName === "daomaker" || protocolName === "streamflow") {
        continue
      }
      const rawProtocol = (protocolFile as any).default
      const protocol = rawProtocol.meta;
      if (!protocol.token) errors.push(`Error in ${protocolName}: missing token field`);
      if (tokens.has(protocol.token!)) errors.push(`Error in ${protocolName}: duplicate token ${protocol.token}`);

      tokens.add(protocol.token!);

      if (!Array.isArray(protocol.protocolIds) || protocol.protocolIds.length === 0)
        errors.push(`Error in ${protocolName}: protocolIds should be an array`)
      else {
        protocol.protocolIds.forEach((id: string) => {
          if (protocolIds.has(id) && !duplicateIds.includes(id)) errors.push(`Error in ${protocolName}: duplicate protocolId ${id}`);
          protocolIds.add(id);
        });
      }

      /*
       // Why was the test checking if the notes was duplicated and the unit test had a bug by comparing objects instead of strings?
      if (Array.isArray(protocol.notes)) {
        protocol.notes.forEach((note: string) => {
          if (notes.has(note)) errors.push(`Error in ${protocolName}: duplicate note ${note}`);
          notes.add(note);
        });
      } 
        */

      if (Array.isArray(protocol.sources)) {
        protocol.sources.forEach((source: string) => {
          if (sources.has(source)) errors.push(`Error in ${protocolName}: duplicate source ${source}`);
          sources.add(source);
        });
      }


    } catch (e: any) {
      errors.push(`Error in ${protocolName}: ${e?.message}`);
    }
  }

  if (errors.length > 0) {
    console.table(errors);
    await sendMessage(`Emissions Adapters Validation Errors: \n${errors.join("\n")}`, process.env.DIM_ERROR_CHANNEL_WEBHOOK!);
  }
}

export async function processProtocolList() {
  await init()

  let protocolsArray: string[] = [];
  let protocolErrors: string[] = [];
  let emissionsBrakedown: EmissionBreakdown = {};
  let supplyMetricsBreakdown: Record<string, any> = {};
  const adapters = createEmissionsImportsFile()

  const protocolAdapters = Object.entries(adapters)

  await validateAdapters(adapters)

  // randomize array
  protocolAdapters.sort(() => Math.random() - 0.5);

  await PromisePool.withConcurrency(5)
    .for(protocolAdapters)
    .process(async ([protocolName, rawAdapter]: any) => {
      let adapters = typeof rawAdapter.default === "function" ? await rawAdapter.default() : rawAdapter.default;
      if (!adapters.length) adapters = [adapters];
      await Promise.all(
        adapters.map((adapter: Protocol) =>
          withTimeout(6000000, processSingleProtocol(adapter, protocolName, emissionsBrakedown, supplyMetricsBreakdown), protocolName)
            .then((p: string) => protocolsArray.push(p))
            .catch((err: Error) => {
              console.log(err.message ? `${err.message}: \n storing ${protocolName}` : err);
              protocolErrors.push(protocolName);
            })
        )
      );
    });

  await handlerErrors(protocolErrors);

  await storeR2JSONString("emissionsProtocolsList", JSON.stringify([...new Set(protocolsArray)]));

  await storeR2JSONString("emissionsBreakdown", JSON.stringify(emissionsBrakedown));
  const protocols = Object.values(emissionsBrakedown);
  const aggregated = {
    protocols,
    emission24h: 0,
    emission7d: 0,
    emission30d: 0,
    emissionsMonthlyAverage1y: 0
  };
  protocols.forEach((protocol: any) => {
    aggregated.emission24h += protocol.emission24h;
    aggregated.emission7d += protocol.emission7d;
    aggregated.emission30d += protocol.emission30d;
    if (protocol.emissionsMonthlyAverage1y) {
      aggregated.emissionsMonthlyAverage1y += protocol.emissionsMonthlyAverage1y;
    }
  });
  await storeR2JSONString("emissionsBreakdownAggregated", JSON.stringify(aggregated));
  await storeR2JSONString("emissionsSupplyMetrics", JSON.stringify(supplyMetricsBreakdown));
}

async function handlerErrors(errors: string[]) {
  if (errors.length > 0) {
    let errorMessage: string = `storeEmissions errors: \n`;
    errors.map((e: string) => (errorMessage += `${e}, `));
    process.env.UNLOCKS_WEBHOOK
      ? await sendMessage(errorMessage, process.env.UNLOCKS_WEBHOOK!)
      : console.log(errorMessage);
  }
}



const extensions = ['ts', 'md', 'js']


function createEmissionsImportsFile() {
  const emission_keys = getDirectories(__dirname + `/../protocols`)
  const adapters: any = {}

  emission_keys.forEach(key => {
    try {
      adapters[removeDotTs(key)] = require(`../protocols/${key}`)
    } catch (e) {
      console.log(`Error requiring ../protocols/${key}`, e)
    }
  })

  return adapters
}


function getDirectories(source: string) {
  return readdirSync(source, { withFileTypes: true })
    .map(dirent => dirent.name)
}

function removeDotTs(s: string) {
  const splitted = s.split('.')
  if (splitted.length > 1 && extensions.includes(splitted[splitted.length - 1]))
    splitted.pop()
  return splitted.join('.')
}

async function run() {
  try {
    await withTimeout(8400000, processProtocolList());
  } catch (e) {
    process.env.DIM_ERROR_CHANNEL_WEBHOOK ? await sendMessage(`${e}`, process.env.DIM_ERROR_CHANNEL_WEBHOOK!) : console.log(e);
  }
  process.exit();
}


run()