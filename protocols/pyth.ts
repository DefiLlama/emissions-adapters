import { Protocol } from '../types/adapters';
import { manualCliff, manualStep } from '../adapters/manual';
import { periodToSeconds } from '../utils/time';

const totalQty = 10_000_000_000;
const start = 1700438400;
const aptos: Protocol = {
  'Community Launch': [manualCliff(start, totalQty * 0.06)],
  'Ecosystem Growth': [
    manualCliff(start, totalQty * 0.07),
    manualCliff(
      start + periodToSeconds.month * 6,
      (totalQty * 0.45) / 4
    ),
    manualCliff(
      start + periodToSeconds.month * 18,
      (totalQty * 0.45) / 4
    ),
    manualCliff(
      start + periodToSeconds.month * 30,
      (totalQty * 0.45) / 4
    ),
    manualCliff(
      start + periodToSeconds.month * 42,
      (totalQty * 0.45) / 4
    ),
  ],
  'Publisher Rewards': [
    manualCliff(start, totalQty * 0.0045),
    manualCliff(
      start + periodToSeconds.month * 6,
      (totalQty * 0.215) / 4
    ),
    manualCliff(
      start + periodToSeconds.month * 18,
      (totalQty * 0.215) / 4
    ),
    manualCliff(
      start + periodToSeconds.month * 30,
      (totalQty * 0.215) / 4
    ),
    manualCliff(
      start + periodToSeconds.month * 42,
      (totalQty * 0.215) / 4
    ),
  ],
  'Protocol Development': [
    manualCliff(start, totalQty * 0.015),
    manualCliff(
      start + periodToSeconds.month * 6,
      (totalQty * 0.085) / 4
    ),
    manualCliff(
      start + periodToSeconds.month * 18,
      (totalQty * 0.085) / 4
    ),
    manualCliff(
      start + periodToSeconds.month * 30,
      (totalQty * 0.085) / 4
    ),
    manualCliff(
      start + periodToSeconds.month * 42,
      (totalQty * 0.085) / 4
    ),
  ],
  'Private Sales': [
    manualCliff(
      start + periodToSeconds.month * 6,
      (totalQty * 0.1) / 4
    ),
    manualCliff(
      start + periodToSeconds.month * 18,
      (totalQty * 0.1) / 4
    ),
    manualCliff(
      start + periodToSeconds.month * 30,
      (totalQty * 0.1) / 4
    ),
    manualCliff(
      start + periodToSeconds.month * 42,
      (totalQty * 0.1) / 4
    ),
  ],

  meta: {
    sources: [
      'https://pyth.network/blog/understanding-the-pyth-tokenomics',
    ],
    token: 'coingecko:pyth-network',
    protocolIds: ['4022'],
  },
  categories: {
    insiders: ['Protocol Development', 'Private Sales'],
    noncirculating: ['Ecosystem Growth', 'Publisher Rewards'],
    airdrop: ['Community Launch'],
  },
};
export default aptos;
