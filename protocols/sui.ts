import { Protocol } from '../types/adapters';
import { manualCliff, manualStep } from '../adapters/manual';
import { periodToSeconds } from '../utils/time';

const totalQty = 10e9;
const start = 1680307200;
const sui: Protocol = {
  'Community Reserve': [
    manualCliff(start, totalQty / 20),
    manualStep(
      start + periodToSeconds.month * 12,
      periodToSeconds.month,
      24,
      totalQty * 0.0015
    ),
    manualStep(
      start + periodToSeconds.month * 36,
      periodToSeconds.month,
      12,
      totalQty * 0.00015
    ),
    manualStep(
      start + periodToSeconds.month * 36,
      periodToSeconds.month,
      48,
      totalQty * 0.0007
    ),
  ],
  'Early Contributors': [
    manualStep(start, periodToSeconds.month, 84, totalQty / 20 / 84),
  ],
  'Community Access Program': [
    manualStep(start, periodToSeconds.month, 84, totalQty / 20 / 84),
  ],
  'Series A': [
    manualCliff(start + periodToSeconds.month * 12, totalQty / 35),
    manualStep(
      start + periodToSeconds.month * 12,
      periodToSeconds.month,
      24,
      totalQty * 0.0015
    ),
    manualStep(
      start + periodToSeconds.month * 36,
      periodToSeconds.month,
      12,
      totalQty * 0.0001
    ),
    manualStep(
      start + periodToSeconds.month * 36,
      periodToSeconds.month,
      48,
      totalQty * 0.00035
    ),
  ],
  'Series B': [
    manualCliff(start + periodToSeconds.month * 12, totalQty / 25),
    manualStep(
      start + periodToSeconds.month * 12,
      periodToSeconds.month,
      84,
      totalQty / 20 / 84
    ),
  ],
  'Stake Subsidies': [
    manualStep(start, periodToSeconds.month, 96, totalQty / 10 / 96),
  ],
  meta: {
    sources: ['https://blog.sui.io/token-release-schedule/'],
    token: 'coingecko:sui',
    protocolIds: ['3181'],
  },
  categories: {
    insiders: ['Series A', 'Series B', 'Early Contributors'],
    noncirculating: ['Community Access Program'],
  },
};
export default sui;
