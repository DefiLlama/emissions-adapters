import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { months, periodToSeconds, years } from "../utils/time";

const start = 1729641600;
const totalSupply = 7_111_111_104
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
      months(start, 6),
      years(start, 2),
      airdrops * 0.9
    )
  ],
  "Mainnet Pre Seed": manualLinear(
    years(start, 1),
    years(start, 3),
    mainnetPreSeed
  ),
  "OM Upgrade": manualLinear(
    months(start, 4),
    months(start, 48),
    omUpgrade
  ),
  
  "Core Contributors": manualLinear(
    months(start, 30),
    years(start, 5),
    coreContributors
  ),
  
  meta: {
    token: "coingecko:mantra",
    sources: [
      "https://docs.mantrachain.io/mantra-tokenomics",
      "https://mantrachain.io/resources/announcements/mantra-chain-coin-upgrade-timeline-and-key-details",
    ],
    protocolIds: ["181"],
    notes: [
      "On March 2 2026, OM underwent a 4x non-dilutive redenomination (coin split) and rebranded to MANTRA",
      "Post-redenomination total supply: 7,111,111,104 (originally 1,777,777,776 * 4)",
      "Max Supply is infinite, but 7,111,111,104 is the initial supply post-split",
      "50% of supply allocated to mirror legacy token supply via canonical bridge",
      "OM Upgrade tokens have a 4-month cliff with 44-month linear vesting",
      "Core Contributors subject to 30-month cliff followed by 30-month vesting",
      "Airdrops: 10% available at launch, 90% begins vesting after 6-month cliff",
    ]
  },

  categories: {
    noncirculating: ["Ecosystem","Existing OM (EVM)","OM Upgrade"],
    airdrop: ["Airdrops"],
    privateSale: ["Mainnet Pre Seed","Mainnet Seed"],
    insiders: ["Core Contributors"],
  },
};

export default mantra;