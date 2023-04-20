import { manualCliff, manualLinear } from "../adapters/manual";
import adapter from "../adapters/uniswap/uniswap";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

// some missing from uni somewhere
const start = 1600106400;
async function uniswap(): Promise<Protocol> {
  const community = Promise.all(
    [
      "0x4750c43867EF5F89869132ecCF19B9b6C4286E1a",
      "0xe3953D9d317B834592aB58AB2c7A6aD22b54075D",
      "0x4b4e140d1f131fdad6fb59c13af796fd194e4135",
      "0x3d30b1ab88d487b0f3061f40de76845bec3f1e94",
    ].map((a: string) => adapter(a, "ethereum", "uni")),
  );
  return {
    community,
    airdrop: manualCliff(start, 150000000),
    "LP staking": manualLinear(
      start,
      start + periodToSeconds.month * 2,
      20000000,
    ),
    team: manualLinear(start, start + periodToSeconds.year * 4, 180440000),
    investors: manualLinear(start, start + periodToSeconds.year * 4, 180440000),
    advisors: manualLinear(start, start + periodToSeconds.year * 4, 6900000),
    meta: {
      sources: ["https://uniswap.org/blog/uni"],
      token: "ethereum:0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      protocolIds: ["2196", "2197", "2198"],
    },
    sections: {
      farming: ["community"],
      airdrop: ["airdrop"],
      insiders: ["team", "investors", "advisors"],
    },
  };
}
export default await uniswap();
