import { Protocol } from '../types/adapters';
import { manualCliff, manualLinear } from '../adapters/manual';
import { periodToSeconds, readableToSeconds } from '../utils/time';
import { queryAggregatedDailyLogsAmounts } from '../utils/queries';

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

async function processData(data: any) {
  const result = []
  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount / 1e18)
    });
  }
  return result
}

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
  
  'NFT Drops': async () => await queryAggregatedDailyLogsAmounts({
    address: "0x23a1fd006d151e1d920d5de860e82c697e73fbcf",
    topic0: "0x6b9c72f300610bf55a5039528cd34cee5ecab19a9b4dd950add9b336165a0c0b",
    startDate: "2021-03-22"
  }).then(data => processData(data)),
  
  'Staking': async() => await queryAggregatedDailyLogsAmounts({
    address: "0x72267d7090dcab8cb832fc77048f47333c250cb1",
    topic0: "0x6b9c72f300610bf55a5039528cd34cee5ecab19a9b4dd950add9b336165a0c0b",
    startDate: "2021-06-03"
  }).then(data => processData(data)),

  'Founders & Advisors': async() => await queryAggregatedDailyLogsAmounts({
    address: "0xf6e4795173cafa138c76df176dde7c3bda2e14ca",
    topic0: "0x6b9c72f300610bf55a5039528cd34cee5ecab19a9b4dd950add9b336165a0c0b",
    startDate: "2025-03-10"
  }).then(data => processData(data)),

  'Ecosystem': async() => await queryAggregatedDailyLogsAmounts({
    address: "0x7080f65abb8834259668900de238fcfb73ac3f2c",
    topic0: "0x6b9c72f300610bf55a5039528cd34cee5ecab19a9b4dd950add9b336165a0c0b",
    startDate: "2021-03-14"
  }).then(data => processData(data)),
  
  'Development': async() => await queryAggregatedDailyLogsAmounts({
    address: "0xbda122ff9d13e7b5baee2502fa35f8ceb23a4700",
    topic0: "0x6b9c72f300610bf55a5039528cd34cee5ecab19a9b4dd950add9b336165a0c0b",
    startDate: "2023-12-19"
  }).then(data => processData(data)),

  meta: {
    token: 'ethereum:0xe53ec727dbdeb9e2d5456c3be40cff031ab40a55',
    sources: ['https://docs.superverse.co/super-tokenomics', 'https://docs.superverse.co/super-tokenomics/transparency-report'],
    protocolIds: ["1093"],
    notes: [
      'Private rounds have 2-month cliff followed by 6-month linear vesting',
      'Team, ecosystem and development allocations have 12-month cliff followed by 24-month linear vesting'
    ],
  },

  categories: {
    farming: ["NFT Drops", "Ecosystem"],
    staking: ["Staking"],
    liquidity: ["Liquidity"],
    publicSale: ["IDO"],
    privateSale: ["Seed","Private Round 1","Private Round 2","Private Round 3"],
    insiders: ["Founders & Advisors", "Development"],
  },
};

export default superfarm;