import { Protocol } from '../types/adapters';
import { manualCliff, manualLinear, manualStep } from '../adapters/manual';
import { periodToSeconds } from '../utils/time';

const start = 1656720000;
const totalSupply = 1_000_000_000;

// Token allocations
const stakingRewards = totalSupply * 0.1;
const feiCoreTeam = totalSupply * 0.13;
const investors = totalSupply * 0.05;
const initialDexOffering = totalSupply * 0.2;
const genesisGroup = totalSupply * 0.1;

const fei: Protocol = {

  'Initial DEX Offering': manualCliff(
    start,
    initialDexOffering
  ),

  'Genesis Group': manualCliff(
    start,
    genesisGroup
  ),

  'FEI Core Team': [
    manualLinear(
      start,
      start + periodToSeconds.year,
      feiCoreTeam * 0.10 // Remaining 10% in year 1
    ),
    manualLinear(
      start + periodToSeconds.years(1),
      start + periodToSeconds.years(2),
      feiCoreTeam * 0.15 // Remaining 15% in year 2
    ),
    manualLinear(
      start + periodToSeconds.years(2),
      start + periodToSeconds.years(3),
      feiCoreTeam * 0.20 // Remaining 20% in year 3
    ),
    manualLinear(
      start + periodToSeconds.years(3),
      start + periodToSeconds.years(4),
      feiCoreTeam * 0.25 // Remaining 25% in year 4
    ),
    manualLinear(
      start + periodToSeconds.years(4),
      start + periodToSeconds.years(5),
      feiCoreTeam * 0.30 // Remaining 30% in year 5
    )
  ],

  'Staking Rewards': manualLinear(
    start,
    start + periodToSeconds.years(2),
    stakingRewards
  ),

  'Investors': manualLinear(
    start,
    start + periodToSeconds.years(4),
    investors
  ),

  meta: {
    token: 'ethereum:0xc7283b66eb1eb5fb86327f08e1b5816b0720212b',
    sources: ['https://medium.com/fei-protocol/the-tribe-token-distribution-887f26169e44'], // Replace with actual source
    protocolIds: ["255"],
    notes: [
      "DAO Treasury and Grants are not included in this analysis"
    ],
  },

  categories: {
    staking: ["Staking Rewards"],
    publicSale: ["Initial DEX Offering"],
    privateSale: ["Investors"],
    insiders: ["FEI Core Team","Genesis Group"],
  },
};

export default fei;