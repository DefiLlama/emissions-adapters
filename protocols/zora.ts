import { manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const tgeTimestamp = 1745366400; 

const totalSupply = 10_000_000_000;

const vestingStartTimestamp = tgeTimestamp + periodToSeconds.months(6);

const incentivesAllocation = totalSupply * 0.20;
const airdropAllocation = totalSupply * 0.10;
const liquidityAllocation = totalSupply * 0.05;
const treasuryAllocation = totalSupply * 0.20;
const teamAllocation = totalSupply * 0.189;
const investorsAllocation = totalSupply * 0.261;


const zora: Protocol = {
  "Retroactive Airdrop": manualCliff(tgeTimestamp, airdropAllocation),
  "Community Incentives": manualCliff(tgeTimestamp, incentivesAllocation),
  "Ecosystem Liquidity": manualCliff(tgeTimestamp, liquidityAllocation),
  "Team": manualStep(
    vestingStartTimestamp,      
    periodToSeconds.month,      
    36,                         
    teamAllocation / 36         
  ),
  "Investors": manualStep(
    vestingStartTimestamp,      
    periodToSeconds.month,      
    36,                         
    investorsAllocation / 36    
  ),
  "Treasury": manualStep(
    vestingStartTimestamp,      
    periodToSeconds.month,      
    48,                         
    treasuryAllocation / 48
  ),

  meta: {
    notes: [
      "Allocations described as 'Not subject to lockup restrictions' (Incentives, Airdrop, Liquidity) are modeled as fully unlocked at TGE using manualCliff.",
      "Treasury, Team, and Investors unlocks start 6 months post-TGE and occur monthly, modeled using manualStep.",
    ],
    sources: ["https://support.zora.co/en/articles/4797185"],
    token: `base:0x1111111111166b7fe7bd91427724b487980afc69`,
    protocolIds: ["parent#zora"],
  },
  categories: {
    farming: ["Community Incentives"],
    airdrop: ["Retroactive Airdrop"],
    liquidity: ["Ecosystem Liquidity"],
    noncirculating: ["Treasury"],
    insiders: ["Team", "Investors"],
  }
};

export default zora;