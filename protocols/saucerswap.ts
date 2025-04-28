import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const TOTAL_SUPPLY = 1_000_000_000;

const start = 1659484800;
const v2_start = 1700179200; // November 17, 2023

const THREE_YEARS = periodToSeconds.years(3);
const SIX_YEARS = periodToSeconds.years(6);

const LIQUIDITY_AMOUNT = TOTAL_SUPPLY * 0.02; // 20M
const COMMUNITY_AMOUNT = TOTAL_SUPPLY * 0.14; // 140M
const MARKETING_INITIAL_AMOUNT = TOTAL_SUPPLY * 0.02; // 20M (Initial)
const MARKETING_VESTED_AMOUNT = TOTAL_SUPPLY * 0.02; // 20M (Vested) -> Total Marketing 40M (4%)
const OPERATIONS_INITIAL_AMOUNT = TOTAL_SUPPLY * 0.02; // 20M (Initial)
const OPERATIONS_VESTED_AMOUNT = TOTAL_SUPPLY * 0.02; // 20M (Vested)
// Operations total is 6.34% (63.4M). 40M from initial/vested. Remaining 23.4M from Masterchef DAO share.
const OPERATIONS_MASTERCHEF_DAO_SHARE = TOTAL_SUPPLY * 0.0634 - OPERATIONS_INITIAL_AMOUNT - OPERATIONS_VESTED_AMOUNT; // 23.4M
const ADVISOR_AMOUNT = TOTAL_SUPPLY * 0.02; // 20M
const CORE_DEV_AMOUNT = TOTAL_SUPPLY * 0.24; // 240M
const YIELD_FARM_AMOUNT = TOTAL_SUPPLY * 0.3539; // 353.9M
const DEVCUT_AMOUNT = TOTAL_SUPPLY * 0.0497; // 49.7M
const LARI_AMOUNT = TOTAL_SUPPLY * 0.0730; // 73.0M

const YIELD_FARM_PHASE1 = 208_330_000; // Based on rate * duration, adjusted
const YIELD_FARM_PHASE2 = YIELD_FARM_AMOUNT - YIELD_FARM_PHASE1; // 145,570,000

const DEVCUT_PHASE1 = 20_840_000; // Based on rate * duration, adjusted
const DEVCUT_PHASE2 = DEVCUT_AMOUNT - DEVCUT_PHASE1; // 28,860,000

const saucerswap: Protocol = {
  "Liquidity": manualCliff(
    start,
    LIQUIDITY_AMOUNT
  ),
  "Community": manualCliff(
    start,
    COMMUNITY_AMOUNT
  ),
  "Marketing": [
    manualCliff(start, MARKETING_INITIAL_AMOUNT),
    manualLinear(start, start + THREE_YEARS, MARKETING_VESTED_AMOUNT)
  ],
  "Operations": [
    manualCliff(start, OPERATIONS_INITIAL_AMOUNT),
    manualLinear(start, start + THREE_YEARS, OPERATIONS_VESTED_AMOUNT), // 3-year linear vesting
    manualLinear(start, start + SIX_YEARS, OPERATIONS_MASTERCHEF_DAO_SHARE)
  ],
  "Advisor": manualLinear(
    start,
    start + THREE_YEARS,
    ADVISOR_AMOUNT
  ),
  "Core Development": manualLinear(
    start,
    start + THREE_YEARS,
    CORE_DEV_AMOUNT
  ),
  "Yield Farm": [
    // Phase 1 Emissions (Genesis -> V2 Launch)
    manualLinear(start, v2_start, YIELD_FARM_PHASE1),
    // Phase 2 Emissions (V2 Launch -> Genesis + 6 Years)
    manualLinear(v2_start, start + SIX_YEARS, YIELD_FARM_PHASE2)
  ],
  "Devcut": [
    // Phase 1 Emissions (Genesis -> V2 Launch)
    manualLinear(start, v2_start, DEVCUT_PHASE1),
    // Phase 2 Emissions (V2 Launch -> Genesis + 6 Years)
    manualLinear(v2_start, start + SIX_YEARS, DEVCUT_PHASE2)
  ],
  "LARI": manualLinear(
    v2_start, 
    start + SIX_YEARS, 
    LARI_AMOUNT
  ),

  meta: {
    notes: [
      "Marketing and Operations allocations include initial amounts at Genesis, 3-year vested amounts, and (for Operations) the DAO's share derived from Masterchef emissions (Devcut & DAO+LARI splits).",
      "Masterchef emissions for Yield Farm, Devcut, and LARI are modeled using two linear phases based on the V2 transition date (Nov 15, 2023).",
      "The amounts for Masterchef-funded categories (Yield Farm, Devcut, LARI, and the DAO portion contributing to Operations) are based on the final percentages in the summary table, distributed across the relevant time phases.",
      "The 'Devcut' category represents the total emission designated as Devcut. The internal split (70% to DAO/Operations, 30% for staking rewards) occurs after emission and is not modeled separately.",
      "The DAO-controlled portions (Marketing, Operations) are categorized as 'noncirculating' until potentially spent or further distributed by the DAO.",
    ],
    sources: ["https://docs.saucerswap.finance/protocol/tokenomics", "https://medium.com/@SaucerSwap/saucerswap-v2-launch-details-f6d4244e27c7", "https://medium.com/@SaucerSwap/saucerswap-v2-tokenomics-proposal-b355182545a6", "https://docs.saucerswap.finance/governance/saucerswap-dao"],
    token: "coingecko:saucerswap",
    protocolIds: ["parent#saucerswap"],
  },
  categories: {
    liquidity: ["Liquidity"],
    airdrop: ["Community"],
    insiders: ["Core Development", "Advisor", "Devcut"],
    farming: ["Yield Farm", "LARI"],
    noncirculating: ["Marketing", "Operations"]
  }
};

export default saucerswap;