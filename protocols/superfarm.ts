import { Protocol } from '../types/adapters';
import { manualCliff, manualLinear } from '../adapters/manual';
import { periodToSeconds } from '../utils/time';

const start = 1613952000;
const totalSupply = 1_000_000_000;

// Token allocations
const staking = totalSupply * 0.25;
const seed = totalSupply * 0.05;
const privateRound1 = totalSupply * 0.09;
const privateRound2 = totalSupply * 0.15;
const privateRound3 = totalSupply * 0.1
const nftDrops = totalSupply * 0.05; 
const liquidity = totalSupply * 0.01;
const ido = totalSupply * 0.01; 
const foundersAdvisors = totalSupply * 0.1; 
const ecosystem = totalSupply * 0.09;
const development = totalSupply * 0.1; 

const superfarm: Protocol = {
  'IDO': manualCliff(start, ido),
  'Liquidity': manualCliff(start, liquidity),
  'Seed': [
    manualCliff(start, seed * 0.15), // 15% unlocked at TGE
    manualLinear(
      start + periodToSeconds.months(6),
      start + periodToSeconds.months(30), // 6 months cliff + 24 months vesting
      seed * 0.85 // Remaining 85%
    )
  ],
  
  'Private Round 1': manualLinear(
    start + periodToSeconds.months(2),
    start + periodToSeconds.months(8), // 2 months cliff + 6 months vesting
    privateRound1
  ),
  
  'Private Round 2': manualLinear(
    start + periodToSeconds.months(2),
    start + periodToSeconds.months(8), // 2 months cliff + 6 months vesting
    privateRound2
  ),
  
  'Private Round 3': manualLinear(
    start + periodToSeconds.months(2),
    start + periodToSeconds.months(8), // 2 months cliff + 6 months vesting
    privateRound3
  ),
  
  'NFT Drops': manualLinear(
    start,
    start + periodToSeconds.years(1),
    nftDrops
  ),
  
  'Staking': manualLinear(
    start,
    start + periodToSeconds.years(1),
    staking
  ),
  
  'Founders & Advisors': manualLinear(
    start + periodToSeconds.years(1),
    start + periodToSeconds.years(3), // 12 months cliff + 24 months vesting
    foundersAdvisors
  ),
  
  'Ecosystem': manualLinear(
    start + periodToSeconds.years(1),
    start + periodToSeconds.years(3), // 12 months cliff + 24 months vesting
    ecosystem
  ),
  
  'Development': manualLinear(
    start + periodToSeconds.years(1),
    start + periodToSeconds.years(3), // 12 months cliff + 24 months vesting
    development
  ),

  meta: {
    token: 'ethereum:0xe53ec727dbdeb9e2d5456c3be40cff031ab40a55',
    sources: ['https://docs.superverse.co/super-tokenomics'],
    protocolIds: ["1093"],
    notes: [
      'Private rounds have 2-month cliff followed by 6-month linear vesting',
      'Team, ecosystem and development allocations have 12-month cliff followed by 24-month linear vesting'
    ],
  },

  categories: {
    noncirculating: ["Ecosystem","Development"],
    farming: ["Staking","NFT Drops"],
    liquidity: ["Liquidity"],
    publicSale: ["IDO"],
    privateSale: ["Seed","Private Round 1","Private Round 2","Private Round 3"],
    insiders: ["Founders & Advisors"],
  },
};

export default superfarm;