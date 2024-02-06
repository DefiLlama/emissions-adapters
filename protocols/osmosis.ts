import { manualCliff, manualLog } from '../adapters/manual';
import { Protocol } from '../types/adapters';
import { periodToSeconds } from '../utils/time';

const qty = 1_000_000_000;
const start = 1630886400;

const osmosis: Protocol = {
  'Liquidity Mining Incentives': [
    manualLog(
      start,
      start + periodToSeconds.years(12),
      qty * 0.257,
      periodToSeconds.year,
      33
    ),
  ],
  'Developer Vesting': [
    manualLog(
      start,
      start + periodToSeconds.years(12),
      qty * 0.225,
      periodToSeconds.year,
      33
    ),
  ],
  'Staking Rewards': [
    manualLog(
      start,
      start + periodToSeconds.years(12),
      qty * 0.325,
      periodToSeconds.year,
      33
    ),
  ],
  'Community Pool': [
    manualLog(
      start,
      start + periodToSeconds.years(12),
      qty * 0.093,
      periodToSeconds.year,
      33
    ),
  ],
  'Community Airdrop': [manualCliff('2021-06-19', qty * 0.05)],
  'Strategic Reserve': [manualCliff('2021-06-19', qty * 0.05)],

  meta: {
    sources: [
      'https://coinmarketcap.com/community/articles/655cef50e96fd653cea5f36d/',
    ],
    token: 'coingecko:osmosis',
    protocolIds: ['383'],
  },
  categories: {
    insiders: ['Developer Vesting'],
    airdrop: ['Community Airdrop', 'Liquidity Mining Incentives'],
    noncirculating: ['Community Pool', 'Strategic Reserve'],
  },
};

export default osmosis;
