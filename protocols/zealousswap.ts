import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

/*
 * ZEAL — Zealous Swap
 * Total supply: 240,000,000
 * TGE / Launch: 2025-04-24
 */

const TOTAL = 240_000_000;
const START = Math.floor(Date.UTC(2025, 3, 24, 0, 0, 0) / 1e3); // 2025-04-24 00:00:00 UTC

// ----- Allocations -----
const YIELD_FARMING = 0.24 * TOTAL;          // 57,600,000
const INFINITY_POOL = 0.18 * TOTAL;          // 43,200,000
const INSURANCE_FUND = 0.03 * TOTAL;         // 7,200,000
const LIQ_AND_LISTINGS = 0.09 * TOTAL;       // 21,600,000
const SALE = 0.20 * TOTAL;                   // 48,000,000
const TEAM = 0.10 * TOTAL;                   // 24,000,000
const NACHO_CREATORS = 0.04 * TOTAL;         // 9,600,000
const NACHO_COMMUNITY_FUND = 0.01 * TOTAL;   // 2,400,000
const COMMUNITY_MGMT = 0.01 * TOTAL;         // 2,400,000

// Active traders airdrops (reserve) — modeled as linear over 24 months after Airdrop 4
// Unallocated, and will be adjusted based on actual airdrop distribution
const FUTURE_TRADER_AIRDROPS = 0.045 * TOTAL; // 10,800,000

// 9y after 2025-04-24 -> 2034-04-24
const FARMS_END = Math.floor(Date.UTC(2034, 3, 24, 0, 0, 0) / 1e3);
const INFINITY_END = FARMS_END;

// Team: 2y cliff then 2y linear vest (start 2027-04-24, end 2029-04-24)
const TEAM_START = Math.floor(Date.UTC(2027, 3, 24, 0, 0, 0) / 1e3);
const TEAM_END = Math.floor(Date.UTC(2029, 3, 24, 0, 0, 0) / 1e3);

const ONE_MONTH = periodToSeconds.month;

// Airdrop timestamps (16:00:00 UTC)
const AIRDROP_1_TS = Math.floor(Date.UTC(2025, 9, 3, 16, 0, 0) / 1e3); // Oct 3, 2025
const AIRDROP_2_TS = Math.floor(Date.UTC(2025, 10, 15, 16, 0, 0) / 1e3); // Nov 15, 2025
const AIRDROP_3_TS = Math.floor(Date.UTC(2025, 11, 15, 16, 0, 0) / 1e3); // Dec 15, 2025
const AIRDROP_4_TS = Math.floor(Date.UTC(2026, 0, 15, 16, 0, 0) / 1e3); // Jan 15, 2026

const zealousSwap: Protocol = {
    "Farms rewards": manualLinear(START, FARMS_END, YIELD_FARMING),
    "Infinity Pool rewards": manualLinear(START, INFINITY_END, INFINITY_POOL),

    "Airdrops": [
        manualCliff(AIRDROP_1_TS, 0.02 * TOTAL),
        manualCliff(AIRDROP_2_TS, 0.015 * TOTAL),
        manualCliff(AIRDROP_3_TS, 0.01 * TOTAL),
        manualCliff(AIRDROP_4_TS, 0.01 * TOTAL),
    ],

    "Future trader airdrops (reserve)": manualLinear(
        AIRDROP_4_TS,
        AIRDROP_4_TS + 24 * ONE_MONTH,
        FUTURE_TRADER_AIRDROPS
    ),

    "Core team (2y cliff, 2y vest)": manualLinear(TEAM_START, TEAM_END, TEAM),

    "Nacho creators (unlocked at launch)": manualCliff(START, NACHO_CREATORS),
    "Nacho community fund (unlocked at launch)": manualCliff(START, NACHO_COMMUNITY_FUND),

    "Community mgmt rewards (monthly x12)": manualStep(
        START,
        ONE_MONTH,
        12,
        COMMUNITY_MGMT / 12
    ),

    "Public sale": manualCliff(START, SALE),
    "Insurance fund (emergency reserve)": manualCliff(START, INSURANCE_FUND),
    "Liquidity & exchange listings (reserve)": manualCliff(START, LIQ_AND_LISTINGS),

    meta: {
        protocolIds: [],
        sources: [
            "https://zealous-swap.gitbook.io/zealous-swap/protocol/zeal-token",
        ],
        token: "kasplex:0xb7a95035618354D9ADFC49Eca49F38586B624040",
        chain: "kasplex",
        total: TOTAL,
    },

    categories: {
        farming: ["Farms rewards"],
        staking: ["Infinity Pool rewards"],
        airdrop: [
            "Airdrops",
            "Future trader airdrops (reserve)",
        ],
        team: ["Core team (2y cliff, 2y vest)"],
        community: ["Community mgmt rewards (monthly x12)"],
        partners: ["Nacho creators (unlocked at launch)"],
        publicSale: ["Public sale"],
        noncirculating: [
            "Insurance fund (emergency reserve)",
            "Liquidity & exchange listings (reserve)",
        ],
        ecosystem: ["Nacho community fund (unlocked at launch)"],
    },
};

export default zealousSwap;