import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1743379200; // March 31, 2025
const totalSupply = 10_000_000_000;

// Allocation percentages of total supply
const communityIncentives = totalSupply * 0.04;
const platformRewards = totalSupply * 0.10;
const foundersTeam = totalSupply * 0.12805;
const advisors = totalSupply * 0.0529;
const nftValidatorStaking = totalSupply * 0.05105;
const privateA = totalSupply * 0.125;
const privateB = totalSupply * 0.20;
const strategicRound = totalSupply * 0.05;
const kolRound = totalSupply * 0.003;
const treasury = totalSupply * 0.13;
const liquidityPool = totalSupply * 0.03;
const gunzFoundation = totalSupply * 0.09;         

const gunz: Protocol = {
  "Community Incentives": manualCliff(start, communityIncentives),
  "NFT Validator Staking":
    manualCliff(start, nftValidatorStaking), // Not circulating
  "Liquidity Pool":
    manualCliff(start, liquidityPool),

  "Private A":
    manualLinear(
      start + periodToSeconds.months(12),
      start + periodToSeconds.months(30), // 12 + 18 months
      privateA
    ),

  "Private B":
    manualLinear(
      start + periodToSeconds.months(12),
      start + periodToSeconds.months(30), // 12 + 18 months
      privateB
    ),

  "Strategic Round":
    manualLinear(
      start + periodToSeconds.months(12),
      start + periodToSeconds.months(18), // 12 + 6 months
      strategicRound
    ),

  "KOL Round": [
    manualCliff(start, kolRound * 0.15), // 15% at TGE
    manualLinear(
      start + periodToSeconds.months(6),
      start + periodToSeconds.months(12), // 6 + 6 months
      kolRound * 0.85 // Remaining 85%
    )],


  "Treasury":
    manualLinear(
      start + periodToSeconds.months(12),
      start + periodToSeconds.months(48), // 12 + 36 months
      treasury
    ),


  "Founders & Team":
    manualLinear(
      start + periodToSeconds.months(30),
      start + periodToSeconds.months(48), // 30 + 18 months
      foundersTeam
    ),

  "Advisors":
    manualLinear(
      start + periodToSeconds.months(12),
      start + periodToSeconds.months(30), // 12 + 18 months
      advisors
    ),

  "GUNZ Foundation":
    manualLinear(
      start + periodToSeconds.months(12),
      start + periodToSeconds.months(48), // 12 + 36 months
      gunzFoundation
    ),

  "Platform Rewards":
    manualLinear(
      start + periodToSeconds.months(1),
      start + periodToSeconds.months(13),
      platformRewards
    ),

  meta: {
    token: "coingecko:gunz",
    sources: ["https://storage.gunbygunz.com/GUNZ__Whitepaper.pdf"],
    protocolIds: ["6030"],
    notes: [
      "NFT Validator Staking allocation is not circulating, but it is included in the total supply.",
      "Liquidity Pool allocation is supposed to be 66% at TGE and 33% unlocked after 1 day of listing but for simplicity, it is set to 100% at TGE",
    ],
    chain: 'gunz'
  },

  categories: {
    noncirculating: ["Treasury","GUNZ Foundation","NFT Validator Staking"],
    liquidity: ["Liquidity Pool"],
    farming: ["Community Incentives","Platform Rewards"],
    privateSale: ["Private A","Private B","Strategic Round"],
    insiders: ["Founders & Team","Advisors","KOL Round"],
  },
};

export default gunz;