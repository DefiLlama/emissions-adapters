import fetch from "node-fetch";
import { call } from "@defillama/sdk/build/abi/abi2";
import { CliffAdapterResult } from "../../types/adapters";
import { getBlock } from "@defillama/sdk/build/computeTVL/blocks";
import { isFuture, periodToSeconds } from "../../utils/time";

type BlockTime = {
  block: number;
  timestamp: number;
};

const owner: string = "0xd374225abb84dca94e121f0b8a06b93e39ad7a99";
const target: string = "0xbc396689893d065f41bc2c6ecbee5e0085233447"; // PERP
const chain: any = "ethereum";
let res: number;

export async function latestDao(): Promise<number> {
  if (!res)
    return fetch(`https://api.llama.fi/emission/perpetual`)
      .then(r => r.json())
      .then(r => JSON.parse(r.body))
      .then(
        r =>
          r.metadata.custom == null || r.metadata.custom.latestTimestamp == null
            ? 1612828800 // DAO contract funded timestamp (block 11819930)
            : r.metadata.custom.latestTimestamp,
      );
  return res;
}

export async function daoSchedule(
  totalAllocation: number,
): Promise<CliffAdapterResult[]> {
  let trackedTimestamp: number;
  let decimals: number;

  [trackedTimestamp, decimals] = await Promise.all([
    latestDao(),
    call({
      target,
      abi: "erc20:decimals",
      chain,
    }),
  ]);

  const allTimestamps: number[] = [];
  let currentTimestamp = trackedTimestamp;

  while (!isFuture(currentTimestamp)) {
    currentTimestamp += periodToSeconds.month;
    allTimestamps.push(currentTimestamp);
  }

  const blockHeights: BlockTime[] = await Promise.all(
    allTimestamps.slice(25).map((t: number) => getBlock(chain, t)),
  );
  //   const blockHeights: BlockTime[] = [
  //     { block: 15270275, timestamp: 1659540962 },
  //     { block: 15466186, timestamp: 1662219362 },
  //     { block: 15668559, timestamp: 1664811362 },
  //     { block: 15890723, timestamp: 1667493362 },
  //     { block: 16105518, timestamp: 1670085362 },
  //     { block: 16327490, timestamp: 1672763762 },
  //     { block: 16549489, timestamp: 1675442162 },
  //     {
  //       block: 16749206,
  //       timestamp: 1677861362,
  //     },
  //     { block: 16969421, timestamp: 1680536162 },
  //     { block: 17181113, timestamp: 1683128162 },
  //   ];
  let balances = await Promise.all(
    blockHeights.map((b: BlockTime) =>
      call({
        target,
        params: [owner],
        abi: "erc20:balanceOf",
        chain,
        block: b.block,
      }),
    ),
  );

  if (balances.length != blockHeights.length)
    throw new Error(
      `block mismatch in perpetual ecosystem and rewards adapter`,
    );

  const sections: CliffAdapterResult[] = [];
  for (let i = 0; i < balances.length; i++) {
    const previousQty =
      i == 0 ? totalAllocation : balances[i - 1] / 10 ** decimals;
    const amount = previousQty - balances[i] / 10 ** decimals;
    if (amount == 0) continue;
    const start = blockHeights[i].timestamp;
    sections.push({ type: "cliff", start, amount });
  }

  return sections;
}
