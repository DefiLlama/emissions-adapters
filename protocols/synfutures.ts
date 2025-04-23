import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1733443200;
const totalSupply = 10_000_000_000;

// Allocation percentages of total supply
const airdrop = totalSupply * 0.075;
const ecosystem = totalSupply * 0.205;
const liquidity = totalSupply * 0.005;
const backersAdvisors = totalSupply * 0.235;
const treasury = totalSupply * 0.25;
const coreContributors = totalSupply * 0.15;
const protocolDev = totalSupply * 0.05;
const liquidityPool = totalSupply * 0.03

const synfutures: Protocol = {
  "Airdrop": manualCliff(start, airdrop),
  "Liquidity Campaign": manualCliff(start, liquidity),
  "Liquidity": manualCliff(start, liquidityPool),
  "Treasury": [
    manualCliff(start, 50_000_000),
    manualLinear(
      start,
      start + periodToSeconds.years(4),
      treasury - 50_000_000
    )],

  "Protocol Development": [
    manualCliff(start, 50_000_000),
    manualLinear(
      start,
      start + periodToSeconds.years(4),
      protocolDev - 50_000_000
    )],
  "Ecosystem": manualLinear(start, start + periodToSeconds.years(4), ecosystem),
  "Backers & Advisors":
    manualLinear(
      start + periodToSeconds.months(6),
      start + periodToSeconds.months(42),
      backersAdvisors
    ),

  "Core Contributors":manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(42),
    coreContributors
  ),

 
  meta: {
    token: "ethereum:0x6e15a54b5ecac17e58dadeddbe8506a7560252f9",
    sources: ["https://medium.com/synfutures/introducing-synfutures-foundation-and-the-f-token-207bf843f0eb"],
    protocolIds: ["parent#synfutures"],
    notes: [
    
    ]
  },

  categories: {
    insiders: [
      "Core Contributors",
      "Backers & Advisors",
    ],
    noncirculating: [
      "Ecosystem",
      "Treasury",
      "Protocol Development"
    ],
    liquidity: [
      "Liquidity",
    ],
    farming: [
      "Liquidity Campaign",
    ],
    airdrop:[
      "Airdrop"
    ]
  },
};

export default synfutures;