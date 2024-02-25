import { Protocol } from '../types/adapters';
import { manualCliff, manualStep } from '../adapters/manual';
import { periodToSeconds } from '../utils/time';

const totalQty = 10e9; // 10 billion tokens
const start = 1683072000; // May 3, 2023

const sui: Protocol = {
  'ICO $0.03': [
    manualCliff(start, totalQty * 0.0138),
  ],
  'Binance Launchpool': [
    manualCliff(start, totalQty * 0.004),
  ],
  'ICO $0.1': [
    manualCliff(start, (totalQty * 0.045) * 0.07),
    manualStep(
      start,
      periodToSeconds.month,
      13,
      (totalQty * 0.045) * 0.93 / 13
    ),
  ],
  'Community Reserve': [
    manualCliff(start, totalQty * 0.49720000001 * 0.01),
    manualStep(
      start,
      periodToSeconds.month,
      84,
      (totalQty * 0.49720000001) * 0.99 / 84
    ),
  ],
  'Early Contributors': [
    manualStep(
      start + periodToSeconds.month * 6,
      periodToSeconds.month,
      36,
      totalQty * 0.2 / 36
    ),
  ],
  'Mysten Labs Treasury': [
    manualStep(
      start + periodToSeconds.month * 6,
      periodToSeconds.month,
      42,
      totalQty * 0.1 / 42
    ),
  ],  
  'Series A': [
    manualStep(
      start + periodToSeconds.month * 6,
      periodToSeconds.month,
      24,
      totalQty * 0.08 / 24
    ),
  ],
  'Series B': [
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      24,
      totalQty * 0.06 / 24
    ),
  ],
  meta: {
    sources: ['https://blog.sui.io/token-release-schedule/'],
    token: 'coingecko:sui',
    protocolIds: ['3181'],
  },
  categories: {
    insiders: ['Series A', 'Series B', 'Early Contributors'],
    publicSale: ["ICO $0.03","ICO $0.1","Binance Launchpool"],
    noncirculating: ['Mysten Labs Treasury', 'Community Reserve'],
  },
};

export default sui;

