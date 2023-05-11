import fetch from "node-fetch";
import { getBlock } from "@defillama/sdk/build/computeTVL/blocks";
import { lookupBlock } from "@defillama/sdk/build/util";

const secondsPerBlock = {
  ethereum: 12,
};

export async function estimateBlockHeight(timestamp: number, chain: any) {
  const current = await getBlock(chain);
  return (
    current.number +
    (current.timestamp - timestamp) /
      secondsPerBlock[chain as keyof typeof secondsPerBlock]
  );
}
export async function estimateBlockTimestamp(height: number, chain: any) {
  const current = await getBlock(chain);
  return (
    current.timestamp -
    (current.number - height) *
      secondsPerBlock[chain as keyof typeof secondsPerBlock]
  );
}

export async function getBlock2(
  chain: any,
  timestamp: number,
): Promise<number> {
  if (["polygon_zkevm", "vision", "era"].includes(chain))
    return lookupBlock(timestamp, { chain }).then(blockData => blockData.block);
  const res = await (await fetch(
    `https://coins.llama.fi/block/${chain}/${timestamp}`,
  )).json();
  return res.height;
}
