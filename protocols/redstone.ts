import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const start = 1740700800
const totalSupply = 1_000_000_000; // 1 Billion RED

// Calculate allocation amounts
const communityGenesisAllocation = totalSupply * 0.10; // 100,000,000
const protocolDevAllocation = totalSupply * 0.10; // 100,000,000
const coreContributorsAllocation = totalSupply * 0.20; // 200,000,000
const binanceLaunchpoolAllocation = totalSupply * 0.04; // 40,000,000
const ecosystemDataProvidersAllocation = totalSupply * 0.243; // 243,000,000
const earlyBackersAllocation = totalSupply * 0.317; // 317,000,000

const redstone: Protocol = {
  "Community & Genesis": manualCliff(start, communityGenesisAllocation),
  "Binance Launchpool": manualCliff(start, binanceLaunchpoolAllocation),
  "Early Backers": [
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.months(30),
      earlyBackersAllocation,
    ),
  ],
  "Ecosystem & Data Providers": [
    manualCliff(start, 20_000_000),
    manualLinear(
        start + periodToSeconds.months(6),
        start + periodToSeconds.months(12),
        20_000_000,
    ),
    manualLinear(
        start + periodToSeconds.months(12),
        start + periodToSeconds.months(30),
        ecosystemDataProvidersAllocation - 40_000_000,
    )
  ],
  "Protocol Development": [
    manualCliff(start, 20_000_000),
    manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(12),
    20_000_000,
  ),
    manualLinear(
        start + periodToSeconds.months(12),
        start + periodToSeconds.months(30),
        protocolDevAllocation - 40_000_000,
    ),
],
  "Core Contributors": [
    manualLinear(
        start + periodToSeconds.year,
        start + periodToSeconds.months(30),
        coreContributorsAllocation * 0.7,
      ),
    manualLinear(
        start + periodToSeconds.months(30),
        start + periodToSeconds.months(48),
        coreContributorsAllocation * 0.3,
      ),
  ],

  meta: {
    notes: [
      "Assumed that Community & Genesis and Binance Launchpool (40M) are fully unlocked at TGE.",
      "Cliff periods are assumed to be 6 months for Ecosystem/Data Providers and Protocol Development, and 1 year for Core Contributors. This is based on chart provided in the docs.",
      "Data are modeled after the provided table and chart data from docs. Might not be 100% accurate.",
    ],
    sources: ["https://blog.redstone.finance/2025/02/12/introducing-red-tokenomics/", "https://www.binance.com/en/research/projects/redstone"],
    token: "ethereum:0xc43c6bfeda065fe2c4c11765bf838789bd0bb5de",
    protocolIds: ["6112"],
  },
  categories: {
    publicSale: ["Binance Launchpool"],
    airdrop: ["Community & Genesis"],
    insiders: ["Core Contributors", "Early Backers"],
    farming: ["Ecosystem & Data Providers"],
    noncirculating: ["Protocol Development"],
  },
};

export default redstone;