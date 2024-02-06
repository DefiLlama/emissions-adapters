import { Protocol } from '../types/adapters';
import { manualStep } from '../adapters/manual';
import { periodToSeconds } from '../utils/time';

const totalQty = 1_130_000_000;
const start = 1664236800;
const axelar: Protocol = {
  'Community Programs': [
    manualStep(
      start,
      periodToSeconds.month,
      47,
      (totalQty * 0.3) / 47
    ),
  ],
  'Company - Core Team': [
    manualStep(
      start + periodToSeconds.month * 3,
      periodToSeconds.month,
      47,
      (totalQty * 0.17) / 47
    ),
  ],
  'Seed Round': [
    manualStep(
      start + periodToSeconds.month * 3,
      periodToSeconds.month,
      23,
      (totalQty * 0.13) / 23
    ),
  ],
  'Series A': [
    manualStep(
      start + periodToSeconds.month * 3,
      periodToSeconds.month,
      23,
      (totalQty * 0.126) / 23
    ),
  ],
  'Series B': [
    manualStep(
      start + periodToSeconds.month * 3,
      periodToSeconds.month,
      23,
      (totalQty * 0.035) / 23
    ),
  ],
  'Company - Operations': [
    manualStep(
      start + periodToSeconds.month * 3,
      periodToSeconds.month,
      47,
      (totalQty * 0.125) / 47
    ),
  ],
  'Insurance Fund': [
    manualStep(
      start,
      periodToSeconds.month,
      47,
      (totalQty * 0.05) / 47
    ),
  ],
  'Community Sale': [
    manualStep(
      start,
      periodToSeconds.month,
      9,
      (totalQty * 0.05) / 9
    ),
  ],

  meta: {
    sources: [
      'https://medium.com/@axelar-foundation/an-overview-of-axl-token-economics-4dc701c9054d',
    ],
    token: 'coingecko:axelar',
    protocolIds: ['2237'],
  },
  categories: {
    insiders: [
      'Company - Core Team',
      'Company - Operations',
      'Seed Round',
      'Series A',
      'Series B',
    ],
    noncirculating: ['Community Programs', 'Insurance Fund'],
    airdrop: ['Community Sale'],
  },
};
export default axelar;
