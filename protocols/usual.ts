import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1731542400;
const totalSupply = 4_000_000_000;

// Allocation amounts
const community = totalSupply * 0.645;
const initialAirdrop = totalSupply * 0.085;
const binanceLaunchpool = totalSupply * 0.075;
const daoEcosystem = totalSupply * 0.075;
const investorsAdvisors = totalSupply * 0.0568;
const team = totalSupply * 0.0432;
const liquidity = totalSupply * 0.02;

const usual: Protocol = {
  "Binance Launchpool":
    manualCliff(
      start,
      binanceLaunchpool
    ),
  "Initial Airdrop": manualLinear(
    start,
    start + periodToSeconds.months(4),
    initialAirdrop
  ),

  "Liquidity": [
    manualCliff(start, liquidity * 0.3),   // 30% at TGE
    manualLinear(
      start,
      start + periodToSeconds.year,
      1_411_200               // ~0.21% per month for 1 year
    ),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      54_588_800               // ~1.19% per month for 3 years
    )
  ],

  "Team": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(4),
    team
  ),
  "Investors & Advisors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(4),
    investorsAdvisors
  ),
  "DAO and Ecosystem": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(4),
    daoEcosystem
  ),


  "Community Incentives": [
    manualLinear(
      start,
      start + periodToSeconds.year,
      250_776_000 // ~0.81% per month for 1 year based on Binance chart
    ),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      community - 250_776_000
    )
  ],

  meta: {
    token: "ethereum:0xC4441c2BE5d8fA8126822B9929CA0b81Ea0DE38E",
    sources: ["https://www.binance.com/en/research/projects/usual"],
    protocolIds: ["4882"],
    notes: [
    ]
  },

  categories: {
    insiders: [
      "Team",
      "Investors & Advisors",
    ],
    noncirculating: [
      "DAO and Ecosystem",
      "Community Incentives",
      "Liquidity",
    ],
    airdrop: [
      "Initial Airdrop",
    ],
    publicSale: [
      "Binance Launchpool",
    ]
  },
};

export default usual;