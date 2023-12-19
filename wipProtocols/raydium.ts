import { Protocol } from "../types/adapters";
import { manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 555_000_000; // Total RAY Supply
const RAY_TGE = 1613865600; // RAY token TGE in UNIX timestamp

// Allocations
const miningReserveAllocation = totalSupply * 0.34; // 34%
const partnershipEcosystemAllocation = totalSupply * 0.30; // 30%
const teamAllocation = totalSupply * 0.20; // 20%
const liquidityAllocation = totalSupply * 0.08; // 8%
const communitySeedAllocation = totalSupply * 0.06; // 6%
const advisorsAllocation = totalSupply * 0.02; // 2%

const raydium: Protocol = {
    "Liquidity": manualLinear(
        RAY_TGE, 
        RAY_TGE + periodToSeconds.year * 3, 
        liquidityAllocation
    ),
    "Mining Reserve": manualLinear(
        RAY_TGE, 
        RAY_TGE + periodToSeconds.year * 3, 
        miningReserveAllocation
    ),
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
        token: "solana:4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", // RAY Solana SPL address
        sources: [
            "https://docs.raydium.io/raydium/ray_token/the-ray-token"
        ],
        protocolIds: ["214"],
    },
    categories: {
        insiders: ["Advisors", "Community & Seed", "Team"],
        noncirculating: ["Partnership & Ecosystem"],
        farming: ["Mining Reserve"],
        liquidity: ["Liquidity"]
    },
};

export default raydium;