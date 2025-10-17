import { multiCall } from "@defillama/sdk/build/abi/abi2";
import { periodToSeconds, unixTimestampNow } from "../../utils/time";
import { getLogs, lookupBlock } from "@defillama/sdk/build/util";
import fetch from "node-fetch";
import abi from "./abi";
import { CliffAdapterResult } from "../../types/adapters";

const boosterDeployed: number = 1685660400;
const factoryDeployed: number = 16032059;
const contracts: { [chain: string]: any } = {
  ethereum: {
    booster: "0x64627901dAdb46eD7f275fD4FC87d086cfF1e6E3",
    PENDLE: "0x808507121b80c02388fad14726482e061b8da827",
    factory: "0x27b1dAcd74688aF24a64BD3C9C1B143118740784",
  },
  arbitrum: {
    booster: "0x64627901dAdb46eD7f275fD4FC87d086cfF1e6E3",
    PENDLE: "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8",
    factory: "0xf5a7De2D276dbda3EEf1b62A9E718EFf4d29dDC8",
  },
};

let res: number;

export async function latest(key: string, backfill: boolean): Promise<number> {
  if (!res!)
    return fetch(`https://api.llama.fi/emission/${key}`)
      .then((r) => r.json())
      .then((r) => {
        try {
          return JSON.parse(r.body).then((r: any) =>
            backfill ||
            r.metadata.incompleteSections == null ||
            r.metadata.incompleteSections[0].lastRecord == null
              ? boosterDeployed
              : r.metadata.incompleteSections[0].lastRecord,
          );
        } catch {
          return boosterDeployed;
        }
      });
  return res;
}

async function getPendleEarned(timestamp: number, chain: any): Promise<number> {
  const block: number = (
    await lookupBlock(timestamp, {
      chain,
    })
  ).block;

  const topic: string =
    "0x166ae5f55615b65bbd9a2496e98d4e4d78ca15bd6127c0fe2dc27b76f6c03143";
  const newMarketLogs = await getLogs({
    target: contracts[chain].factory,
    topic,
    topics: [],
    keys: [],
    fromBlock: factoryDeployed,
    toBlock: block,
    chain,
  });

  const markets: string[] = [];
  newMarketLogs.output.map((m: any) => {
    if (m.topics.length != 3 || m.topics[0] != topic) return;
    markets.push(`0x${m.topics[1].substring(26)}`);
  });

  const res = await multiCall({
    calls: markets.map((target: string) => ({
      target,
      params: [contracts[chain].PENDLE, contracts[chain].booster],
    })),
    block,
    chain,
    abi: abi.userReward,
  });
  const pendleEarned: number = res
    .map((r: any) => r.accrued) //r.index)
    .reduce((p: number, c: number) => Number(p) + Number(c), 0);

  // if (pendleEarned / 10 ** 18 > 1620000) {
  //   console.log("bang");
  // }
  return pendleEarned / 10 ** 18;
}

function getEqbEmitted(inputQty: number, totalMinted: number): number {
  const factor: number = 0.25;
  let a = 0.95 ** (totalMinted / 1e6);
  return factor * 0.95 ** (totalMinted / 1e6) * inputQty;
}

export async function incentives(
  key: string,
  chains: string[],
  maxQty: number,
  backfill: boolean = false,
) {
  const results: CliffAdapterResult[] = [];
  const timestampNow: number = unixTimestampNow();
  const from = await latest(key, backfill);
  let workingQty: number = 0;
  let start: number = from;

  while (start < timestampNow) {
    const pendleEarned = await Promise.all(
      chains.map((c: string) => getPendleEarned(start, c)),
    );
    console.log(pendleEarned.reduce((p: number, c: number) => p + c, 0));

    const emission = getEqbEmitted(
      pendleEarned.reduce((p: number, c: number) => p + c, 0),
      workingQty,
    );

    const amount = emission - workingQty;

    if (workingQty > maxQty) break;

    if (amount > 0) {
      results.push({
        type: "cliff",
        amount,
        start,
      });
      workingQty = emission;
    }

    start += periodToSeconds.day; // RESOLUTION_SECONDS;
  }

  return results;
}
