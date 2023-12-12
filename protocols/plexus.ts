import { Protocol } from "../types/adapters";
import { manualLinear, manualCliff } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 500_000_000; // Total PLX Supply
const PLX_TGE = 1700784000; // Nov 24, 2023

// Allocations
const investorsSeedAllocation = totalSupply * 0.0535; // 5.35%
const investorsPrivateAllocation = totalSupply * 0.0535; // 5.35%
const investorsKOLAllocation = totalSupply * 0.0153; // 1.53%
const investorsPublicAllocation = totalSupply * 0.11; // 11%
const liquidityAllocation = totalSupply * 0.04; // 4%
const initialAirdropAllocation = totalSupply * 0.03; // 3%
const chainlinkBuildAllocation = totalSupply * 0.01; // 1%
const ecosystemAllocation = totalSupply * 0.1419; // 14.19%
const marketingAllocation = totalSupply * 0.0865; // 8.65%
const protocolContributorAllocation = totalSupply * 0.24; // 24%
const advisorAllocation = totalSupply * 0.038; // 3.80%
const teamAllocation = totalSupply * 0.1813; // 18.13%

const plx: Protocol = {
    "Seed Investors": [
        manualCliff(PLX_TGE, investorsSeedAllocation * 0.10),
        manualLinear(
            PLX_TGE + periodToSeconds.month * 1,
            PLX_TGE + periodToSeconds.month * 9,
            investorsSeedAllocation * 0.90
        )
    ],
    "Private Investors": [
        manualCliff(PLX_TGE, investorsPrivateAllocation * 0.15),
        manualLinear(
            PLX_TGE + periodToSeconds.month * 1,
            PLX_TGE + periodToSeconds.month * 7,
            investorsPrivateAllocation * 0.85
        )
    ],
    "KOL Investors": [
        manualCliff(PLX_TGE, investorsKOLAllocation * 0.15),
        manualLinear(
            PLX_TGE + periodToSeconds.month * 1,
            PLX_TGE + periodToSeconds.month * 6,
            investorsKOLAllocation * 0.85
        )
    ],
    "Public Investors": [
        manualCliff(PLX_TGE, investorsPublicAllocation * 0.20),
        manualLinear(
            PLX_TGE + periodToSeconds.month * 1,
            PLX_TGE + periodToSeconds.month * 6,
            investorsPublicAllocation * 0.80
        )
    ],
    "Liquidity": manualCliff(PLX_TGE, liquidityAllocation),
    "Initial Airdrop": manualLinear(
        PLX_TGE,
        PLX_TGE + periodToSeconds.month * 12,
        initialAirdropAllocation
    ),
    "Chainlink Build": manualLinear(
        PLX_TGE,
        PLX_TGE + periodToSeconds.year * 3,
        chainlinkBuildAllocation
    ),
    "Ecosystem": manualLinear(
        PLX_TGE,
        PLX_TGE + periodToSeconds.year * 3,
        ecosystemAllocation
    ),
    "Marketing": manualLinear(
        PLX_TGE,
        PLX_TGE + periodToSeconds.year * 4,
        marketingAllocation
    ),
    "Protocol Contributor": manualLinear(
        PLX_TGE,
        PLX_TGE + periodToSeconds.year * 4,
        protocolContributorAllocation
    ),
    "Advisor": manualLinear(
        PLX_TGE + periodToSeconds.month * 6,
        PLX_TGE + periodToSeconds.month * 24,
        advisorAllocation
    ),
    "Team": manualLinear(
        PLX_TGE + periodToSeconds.month * 8,
        PLX_TGE + periodToSeconds.month * 34,
        teamAllocation
    ),

    meta: {
        notes: [
            `The emission and distribution details are based on the proposed and intended token emission and distribution for PLX.`,
            `The exact details might vary based on real-time decisions and governance.`,
        ],
        token: "arbitrum:0x153516904bc7E28aE7C526E8aEe4EC5EaE878eDB",
        sources: [
            "https://docs.plexus.app/plexus/tokenomics/tokenomics"
        ],
        protocolIds: ["2740"],
    },
    categories: {
        liquidity: ["Liquidity"],
        farming: ["Chainlink Build"],
        noncirculating: ["Ecosystem", "Marketing"],
        airdrop: ["Initial Airdrop"],
        insiders: ["Team", "Advisor","Protocol Contributor", "Private Investors", "KOL Investors", "Seed Investors"],
        publicSale: ["Public Investors" ]
    },
};

export default plx;