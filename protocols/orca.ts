import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1628553600; // August 10, 2021
const totalSupply = 100_000_000;

// Initial circulating allocations
const liquidityProviders = totalSupply * 0.04;
const averageTraders = totalSupply * 0.005;
const heavyTraders = totalSupply * 0.005;
const initialAdvisors = totalSupply * 0.0025;

// Team and investor allocations
const team = totalSupply * 0.20; // 20%
const privateSale = totalSupply * 0.096; // 9.6%
const valueAddAdvisory = totalSupply * 0.043; // 4.3%

const orca: Protocol = {
  "Liquidity Providers": manualCliff(start, liquidityProviders),
  "Average Traders Airdrop": manualCliff(start, averageTraders),
  "Heavy Traders Airdrop": manualCliff(start, heavyTraders),
  "Initial Advisors": manualCliff(start, initialAdvisors),
  
  "Team": manualLinear(
    start + periodToSeconds.years(1), // 1-year cliff
    start + periodToSeconds.years(3), // 3-year total vesting
    team
  ),
  
  "Private Sale": manualLinear(
    start + periodToSeconds.years(1), // 1-year lockup
    start + periodToSeconds.years(3), // 3-year total vesting
    privateSale
  ),
  
  "Value Add and Advisory": manualLinear(
    start + periodToSeconds.years(1), // 1-year cliff
    start + periodToSeconds.years(3), // 3-year total vesting
    valueAddAdvisory
  ),
  
  meta: {
    token: "solana:orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    sources: ["https://docs.orca.so/orca-for-community/tokenomics"],
    protocolIds: ["283"],
    notes: [
      "Initial circulating supply was airdropped based on liquidity provider and trader activity between launch and Aug 2, 2021",
      "Approximately 60.85% of the total supply allocation is not specified in the provided information"
    ]
  },
  
  categories: {
    insiders: [
      "Team",
      "Private Sale",
      "Value Add and Advisory",
      "Initial Advisors"
    ],
    liquidity: [
      "Liquidity Providers",
    ],
    airdrop: [
      "Average Traders Airdrop",
      "Heavy Traders Airdrop",
    ],
  },
};

export default orca;