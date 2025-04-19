import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import adapter from "../adapters/fluid";

const fluid: Protocol = {
  "Future Community Initiatives": manualCliff(
    "2021-04-06",
    40_000_000
  ),

  "Airdrop": [
    manualCliff("2021-06-16", 10_000_000),
    manualCliff("2021-06-16", 1_000_000),
  ],
  "Liquidity Mining": manualLinear(
    "2021-06-16",
    "2021-09-16",
    3_000_000
  ),
  "UNI-v3 Staking": manualLinear(
    "2021-06-16",
    "2021-09-16",
    1_000_000
  ),

  "Vested Allocations": () => adapter(),
  
  meta: {
    sources: [
      "InstaVestingFactory deployed at 0x3b05a5295Aa749D78858E33ECe3b97bB3Ef4F029",
      "https://blog.instadapp.io/inst/"
    ],
    token: "coingecko:instadapp",
    protocolIds: ["parent#fluid"],
    notes: [
      "INST token was rebranded to FLUID",
      "40M tokens reserved for future community initiatives governed by DAO, In this analysis we assume it's unlocked",
      "Vested Allocations should be 45M total, including Team (23.8M), Investors (12.1M), Future Team (7.8M), and Advisors (1.3M) with 4-year vesting schedules",
      "However based on onchain data, only 37.293.668 tokens are vested",
      "Due to the nature of the vesting contracts, we cannot determine the exact amounts for each allocation",
    ]
  },
  categories: {
    insiders: ["Vested Allocations"],
    farming: ["Liquidity Mining", "UNI-v3 Staking"],
    noncirculating: ["Future Community Initiatives"],
  }
};

export default fluid;
