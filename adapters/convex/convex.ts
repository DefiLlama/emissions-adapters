import { call, multiCall } from "@defillama/sdk/build/abi/abi2";
import { periodToSeconds, unixTimestampNow } from "../../utils/time";
import abi from "./abi";

const cliffQty = 100000 * 1e18;
const cliffCount = 1000;
const maxSupply = 100000000 * 1e18;

export default async function convex(
  chain: any,
  target: string,
  start: number,
) {
  let emission = 1;
  let timestamp = start;
  const results = [];
  const timestampNow = unixTimestampNow();
  while (timestamp > timestampNow) {
    try {
      emission = await getCvxEmitted(chain, target, timestamp);
      results.push(await getCvxEmitted(chain, target, timestamp));
      timestamp += periodToSeconds.day;
    } catch {
      return results;
    }
  }
  return results;
}
async function getCrvEarned(block: number): Promise<number> {
  const chain: any = "ethereum";
  const convexBoosterAddress: string =
    "0x989AEb4d175e16225E39E87d0D97A3360524AD80";
  const curveBoosterAddress: string =
    "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
  const curveMinterAddress: string =
    "0xd061D61a4d941c39E5453435B6345Dc261C2fcE0";
  const gaugeLength: number = Number(
    await call({
      chain,
      target: curveBoosterAddress,
      abi: abi.poolLength,
      block,
    }),
  );
  const gaugeIndexes: number[] = Array.from(Array(gaugeLength).keys());
  let calls: object[] = gaugeIndexes.map((i: number) => ({
    target: curveBoosterAddress,
    params: i,
  }));
  const gauges: string[] = (
    await multiCall({
      chain,
      calls,
      abi: abi.poolInfo,
      block,
    })
  ).map((i: any) => i.gauge);
  calls = gauges.map((g: string) => ({
    target: curveMinterAddress,
    params: [convexBoosterAddress, g],
  }));
  const minteds: number[] = await multiCall({
    chain,
    calls,
    abi: abi.minted,
    block,
  });
  const minted: number = minteds.reduce(
    (p: Number, c: Number) => Number(p) + Number(c),
    0,
  );
  return minted; // https://etherscan.io/token/0x5f3b5dfeb7b28cdbd7faba78963ee202a494e2a2#balancs
}

async function getCvxEmitted(
  chain: any,
  target: string,
  block: number,
): Promise<number> {
  const [cvxSupply, crvEarned] = await Promise.all([
    call({
      target,
      chain,
      abi: "erc20:totalSupply",
      block,
    }),
    getCrvEarned(block),
  ]);
  const currentCliff = Math.floor(cvxSupply / cliffQty);
  if (cliffCount < currentCliff) return 0;
  const remaining = cliffCount - currentCliff;
  const cvxEarned = (crvEarned * remaining) / cliffCount;
  let amountTillMax = maxSupply - cvxSupply;
  console.log(
    (cvxEarned > amountTillMax ? cvxEarned : amountTillMax) / 10 ** 18,
  );
  return cvxEarned > amountTillMax ? cvxEarned : amountTillMax;
}
