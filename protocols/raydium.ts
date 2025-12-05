import { Protocol } from "../types/adapters";
import { manualLinear, manualCliff } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 555_000_000; 
const RAY_TGE = 1613865600; // Sunday, February 21, 2021

// Allocations
const miningReserveTotalAllocation = totalSupply * 0.34; // 34%
const partnershipEcosystemAllocation = totalSupply * 0.30; // 30%
const teamAllocation = totalSupply * 0.20; // 20%
const liquidityAllocation = totalSupply * 0.08; // 8%
const communitySeedAllocation = totalSupply * 0.06; // 6%
const advisorsAllocation = totalSupply * 0.02; // 2%

// Custom function for Mining Reserve with halving
function miningReserveVesting() {
    let vestingSchedules = [];
    let remainingAllocation = miningReserveTotalAllocation;
    let currentStart = RAY_TGE;
    const halvingPeriod = periodToSeconds.month * 6;

    for (let i = 0; i < 6; i++) { // 6 periods of 6 months each
        let periodAllocation = remainingAllocation / (6 - i); // Dividing remaining allocation equally among remaining periods
        vestingSchedules.push(manualLinear(currentStart, currentStart + halvingPeriod, periodAllocation));

        currentStart += halvingPeriod;
        remainingAllocation -= periodAllocation;
    }

    return vestingSchedules;
}

const raydium: Protocol = {
    "Liquidity": manualCliff(
        RAY_TGE, 
        liquidityAllocation
    ),
    "Mining Reserve": miningReserveVesting(),
    "Partnership & Ecosystem": manualLinear(
        RAY_TGE, 
        RAY_TGE + periodToSeconds.year * 3, 
        partnershipEcosystemAllocation
    ),
    "Team": manualLinear(
        RAY_TGE + periodToSeconds.year, 
        RAY_TGE + periodToSeconds.year * 3, 
        teamAllocation
    ),
    "Community & Seed": manualLinear(
        RAY_TGE + periodToSeconds.year, 
        RAY_TGE + periodToSeconds.year * 3, 
        communitySeedAllocation
    ),
    "Advisors": manualLinear(
        RAY_TGE + periodToSeconds.year, 
        RAY_TGE + periodToSeconds.year * 3, 
        advisorsAllocation
    ),
    meta: {
        notes: [
            `The emission and distribution details are based on the proposed and intended token emission and distribution for RAY tokens.`,
            `Emissions have been slower than originally planned and mining reserve will likely continue to be emitted longer than the initial 36 months, it's vesting at a rate of 134,649.95 RAY per day; at current rates, there's roughly 40 years left of liquidity mining`,
          ],
        token: "solana:4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        sources: [
            "https://docs.raydium.io/raydium/ray_token/the-ray-token"
        ],
        protocolIds: ["214"],
    },
    categories: {
        insiders: ["Team", "Advisors", "Community & Seed"],
        noncirculating: ["Partnership & Ecosystem"],
        farming: ["Mining Reserve"],
        liquidity: ["Liquidity"]
    },
};

export default raydium;