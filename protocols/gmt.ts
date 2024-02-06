import { Protocol } from '../types/adapters';
import { manualCliff, manualStep } from '../adapters/manual';
import { periodToSeconds } from '../utils/time';

const totalQty = 6_000_000_000;
const start = 1646784000;
const aptos: Protocol = {
  'Move And Earn': [
    manualStep(
      start + periodToSeconds.month * 6,
      periodToSeconds.month,
      35,
      totalQty * 0.3 * 0.0166
    ),
    manualStep(
      start + periodToSeconds.month * 41,
      periodToSeconds.month,
      35,
      (totalQty * 0.3 * 0.0166) / 2
    ),
    manualStep(
      start + periodToSeconds.month * 76,
      periodToSeconds.month,
      25,
      (totalQty * 0.3 * 0.0166) / 4
    ),
  ],
  'Ecosystem / Treasury': [
    manualCliff(start, totalQty * 0.3 * 0.1),
    manualStep(
      start + periodToSeconds.month,
      periodToSeconds.month,
      90,
      totalQty * 0.3 * 0.01
    ),
  ],
  'Private Sale': [
    manualStep(
      start + periodToSeconds.months(12),
      periodToSeconds.month,
      9,
      totalQty * 0.163 * 0.0387
    ),
    manualStep(
      start + periodToSeconds.months(21),
      periodToSeconds.month,
      9,
      totalQty * 0.163 * 0.0331
    ),
    manualStep(
      start + periodToSeconds.months(29),
      periodToSeconds.month,
      12,
      totalQty * 0.163 * 0.0208
    ),
    manualStep(
      start + periodToSeconds.months(41),
      periodToSeconds.month,
      6,
      totalQty * 0.163 * 0.0174
    ),
  ],
  Team: [
    manualStep(
      start + periodToSeconds.months(12),
      periodToSeconds.month,
      48,
      totalQty * 0.142 * 0.0208
    ),
  ],
  'Binance Launchpad': [manualCliff(start, totalQty * 0.07)],
  Advisors: [
    manualStep(
      start + periodToSeconds.months(12),
      periodToSeconds.month,
      24,
      totalQty * 0.025 * 0.0417
    ),
  ],

  meta: {
    sources: ['https://www.binance.com/en/research/projects/stepn'],
    token: 'coingecko:stepn',
    protocolIds: ['4028'],
  },
  categories: {
    insiders: ['Team', 'Private Sale', 'Advisors'],
    noncirculating: ['Ecosystem / Treasury'],
    airdrop: ['Binance Launchpad'],
  },
};
export default aptos;
