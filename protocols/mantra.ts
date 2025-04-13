import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1729641600;
const totalSupply = 1_777_777_776;

// Allocation amounts
const existingOM = totalSupply * 0.5; // 50% - 888,888,888
const omUpgrade = totalSupply * 0.175; // 17.5% - 311,111,112
const ecosystem = totalSupply * 0.021; // 2.1% - 37,777,777
const mainnetPreSeed = totalSupply * 0.056; // 5.6% - 100,000,000
const mainnetSeed = totalSupply * 0.051; // 5.1% - 90,000,000
const coreContributors = totalSupply * 0.169; // 16.9% - 300,000,000
const airdrops = totalSupply * 0.028; // 2.8% - 50,000,000

const mantra: Protocol = {
  "Existing OM (EVM)": manualCliff(start, existingOM),
  "Ecosystem": manualCliff(start, ecosystem),
  "Mainnet Seed": manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(18),
    mainnetSeed
  ),
  "Airdrops": [
    manualCliff(start, airdrops * 0.1),
    manualLinear(
      start + periodToSeconds.months(6),
      start + periodToSeconds.years(2),
      airdrops * 0.9
    )
  ],
  "Mainnet Pre-Seed": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    mainnetPreSeed
  ),
  "OM Upgrade": manualLinear(
    start + periodToSeconds.months(4),
    start + periodToSeconds.months(48),
    omUpgrade
  ),
  
  "Core Contributors": manualLinear(
    start + periodToSeconds.months(30),
    start + periodToSeconds.years(5),
    coreContributors
  ),
  
  meta: {
    token: "coingecko:mantra-dao",
    sources: ["https://docs.mantrachain.io/learn/tokenomics"],
    protocolIds: ["181"],
    notes: [
      "Total supply of 1,777,777,776 mainnet staking coins at genesis",
      "Max Supply is infinite, but 1,777,777,776 is the initial supply",
      "50% of supply (888,888,888 tokens) allocated to mirror legacy token supply via canonical bridge",
      "OM Upgrade tokens have a 4-month cliff with 44-month linear vesting",
      "Core Contributors subject to 30-month cliff followed by 30-month vesting",
      "Airdrops: 10% available at launch, 90% begins vesting after 6-month cliff",
    ]
  },

  categories: {
    insiders: [
      "Core Contributors",
      "Mainnet Pre-Seed",
      "Mainnet Seed"
    ],
    noncirculating: [
      "Ecosystem",
      "Existing OM (EVM)",
      "OM Upgrade"
    ],
    airdrop: [
      "Airdrops"
    ],
  },
};

export default mantra;