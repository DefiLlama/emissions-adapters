import { Protocol } from "../types/adapters";
import { manualLinear, manualCliff } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 30_000_000; 
const TGE = 1701043201; 

// Allocations
const investorAllocation = totalSupply * 0.10; // 10%
const publicRoundAllocation = totalSupply * 0.10; // 10%
const communityFundAllocation = totalSupply * 0.59; // 59%
const teamAllocation = totalSupply * 0.17; // 17%
const liquidityAllocation = totalSupply * 0.04; // 4%

const hold: Protocol = {
    "Public Round": manualCliff(TGE, publicRoundAllocation),
    "Liquidity": manualCliff(TGE, liquidityAllocation),
    "Community Fund": [
        manualCliff(TGE, communityFundAllocation * 0.055),
        manualLinear(
            TGE, 
            TGE + periodToSeconds.month * 60, 
            communityFundAllocation * 0.945
        )
    ],
    "Investor": [
        manualCliff(TGE + periodToSeconds.month * 6, investorAllocation * 0.5), // First half during the cliff
        manualLinear(
            TGE + periodToSeconds.month * 6, 
            TGE + periodToSeconds.month * 18, 
            investorAllocation * 0.5 // Second half over the 12 months
        )
    ],
    "Team": [
        manualCliff(TGE + periodToSeconds.month * 12, teamAllocation * 0.5), // First half during the cliff
        manualLinear(
            TGE + periodToSeconds.month * 12, 
            TGE + periodToSeconds.month * 72, 
            teamAllocation * 0.5 // Second half over the 60 months
        )
    ],  

    meta: {
        token: "era:0xed4040fD47629e7c8FBB7DA76bb50B3e7695F0f2", 
        sources: [
            "https://docs.holdstation.com/holdstation-docs-en/token/tokenomics"
        ],
        protocolIds: ["2959"], 
    },
    categories: {
    liquidity: ["Liquidity"],
    publicSale: ["Public Round"],
    farming: ["Community Fund"],
    privateSale: ["Investor"],
    insiders: ["Team"],
  },
};

export default hold;