import { Protocol } from '../types/adapters';
import { manualCliff, manualLinear } from '../adapters/manual';
import { periodToSeconds } from '../utils/time';

const start = 1636934400; // November 15, 2021
const totalSupply = 100_000_000_000_000; // 100 trillion VVS tokens

// Token allocations
const farmAndMine = totalSupply * 0.30; // 30%
const tradersAndReferrers = totalSupply * 0.025; // 2.5%
const communityWallet = totalSupply * 0.15; // 15%
const ecosystemDevelopment = totalSupply * 0.135; // 13.5%
const team = totalSupply * 0.23; // 23%
const networkSecurity = totalSupply * 0.135; // 13.5%
const marketMakers = totalSupply * 0.025; // 2.5%

const vvsfinance: Protocol = {
  'Farm and Mine Programs': manualCliff(
    start,
    farmAndMine
  ),
  'Network Security and Maintenance': manualCliff(
    start,
    networkSecurity
  ),

  'Ecosystem Development': manualCliff(
    start,
    ecosystemDevelopment
  ),

  'Market Makers': manualCliff(
    start,
    marketMakers
  ),

  'Traders and Referrers': manualCliff(
    start,
    tradersAndReferrers
  ),

  'Team': manualLinear(
    start,
    start + periodToSeconds.years(4),
    team // Vested linearly over 4 years with daily vesting
  ),

  'Community Wallet': manualCliff(
    start + periodToSeconds.years(1), // Unlocked after 12 months
    communityWallet
  ),


 

  meta: {
    token: 'cronos:0x2d03bece6747adc00e1a131bba1469c15fd11e03',
    sources: ['https://medium.com/vvs-finance/vvs-yearly-emission-halving-and-2023-year-review-179acc569f2f'], 
    protocolIds: ["parent#vvs-finance"],
    notes: [
      "Team tokens vest linearly over 4 years with daily vesting",
      "Community wallet tokens unlock after a 12-month cliff"
    ],
  },

  categories: {
    insiders: ['Team', 'Market Makers'],
    farming: ['Farm and Mine Programs'],
    noncirculating: ['Ecosystem Development', 'Network Security and Maintenance', 'Community Wallet'],
    publicSale: ['Traders and Referrers']
  },
};

export default vvsfinance;