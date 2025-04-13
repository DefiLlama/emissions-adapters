import { Protocol } from '../types/adapters';
import { manualCliff, manualLinear } from '../adapters/manual';
import { periodToSeconds } from '../utils/time';

const start = 1737417600; // January 21, 2025
const totalSupply = 10_000_000_000;

const airdrop = totalSupply * 0.07;
const validators = totalSupply * 0.08;
const communityEcosystem = totalSupply * 0.33;
const foundation = totalSupply * 0.11;
const earlyBackers = totalSupply * 0.21;
const coreContributors = totalSupply * 0.2;

const plume: Protocol = {
  'Community Airdrop': manualCliff(start, airdrop),
  Validators: manualLinear(start, start + periodToSeconds.years(7), validators),
  'Community & Ecosystem': [
    manualCliff(start, communityEcosystem * 0.13), // 13% at TGE
    // Linear Vesting for the rest (20%) over 7 years
    manualLinear(
      start,
      start + periodToSeconds.years(3),
      (communityEcosystem - communityEcosystem * 0.13) * 0.5,
    ),
    manualLinear(
      start + periodToSeconds.years(3),
      start + periodToSeconds.years(7),
      (communityEcosystem - communityEcosystem * 0.13) * 0.5,
    ),
  ],

  Foundation: [
    manualLinear(start, start + periodToSeconds.years(3), foundation * 0.5),

    manualLinear(
      start + periodToSeconds.years(3),
      start + periodToSeconds.years(7),
      foundation * 0.5,
    ),
  ],

  'Core Contributors': [
    manualLinear(
      start + periodToSeconds.months(6), // Start vesting after cliff
      start + periodToSeconds.years(3), // End vesting with others
      coreContributors * 0.5, // 50% of the remaining amount
    ),
    manualLinear(
      start + periodToSeconds.years(3),
      start + periodToSeconds.years(7),
      coreContributors * 0.5, // 50% of the remaining amount
    ),
  ],

  'Early Backers': [
    manualLinear(
      start + periodToSeconds.months(6), // Start vesting after cliff
      start + periodToSeconds.years(3), // End vesting with others
      earlyBackers * 0.5, // 50% of the remaining amount
    ),
    manualLinear(
      start + periodToSeconds.years(3),
      start + periodToSeconds.years(7),
      earlyBackers * 0.5, // 50% of the remaining amount
    ),
  ],

  meta: {
    token: 'coingecko:plume',
    sources: ['https://plumenetwork.xyz/blog/tokenomics'],
    protocolIds: ["6037"],
    notes: [
      'Based on estimated token release schedule we assume that from TGE to 3 years after TGE, 50% of the amount is unlocked linearly',
      'Where the remaining 50% is unlocked linearly from 3 years to 7 years after TGE',
    ],
  },

  categories: {
    insiders: ['Core Contributors', 'Early Backers'],
    noncirculating: ['Foundation', 'Community & Ecosystem'],
    airdrop: ['Airdrop'],
    farming: ['Validators'],
  },
};

export default plume;
