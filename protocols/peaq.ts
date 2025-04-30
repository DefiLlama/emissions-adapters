import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1726704000;
const totalSupply = 4_200_000_000;

// Allocation amounts
const investorsFundingPreseed = totalSupply * 0.07;
const investorsFundingSeed = totalSupply * 0.05;
const investorsFundingPrivate = totalSupply * 0.13;
const investorsFundingPreLaunch = totalSupply * 0.09;

const communitySale = totalSupply * 0.06;
const communityGetReal = totalSupply * 0.05;
const communityEarlyAdopters = totalSupply * 0.0253;
const communityInitial = totalSupply * 0.02;
const communityReserve = totalSupply * 0.0547;

const coreContributors = totalSupply * 0.115;
const eotLabs = totalSupply * 0.085;

const networkSecurityReserve = totalSupply * 0.034583;
const networkGenesisNode = totalSupply * 0.000417;
const networkCoreTime = totalSupply * 0.015;

const ecosystemMarketMaking = totalSupply * 0.0375;
const ecosystemReserve = totalSupply * 0.1118;
const ecosystemCapitalContributions = totalSupply * 0.003;
const ecosystemGrants = totalSupply * 0.0177;
const ecosystemExpansion = totalSupply * 0.03;

const peaq: Protocol = {
  "Ecosystem Market Making & Liquidity": manualCliff(start, ecosystemMarketMaking), 
  "Ecosystem Funds":[ 
    manualCliff(
      start, 
      ecosystemReserve + ecosystemCapitalContributions + ecosystemGrants + ecosystemExpansion
    )
  ],

  "Network Security":[
    manualCliff(start, networkGenesisNode), // 100% at TGE
    manualCliff(start, networkSecurityReserve), // 100% at TGE
    manualLinear(
      start, 
      start + periodToSeconds.months(24), 
      networkCoreTime
    ), //core time lease
  ],

  "Investors (Pre Seed)": [
    manualCliff(start, investorsFundingPreseed * 0.0375), // 3.75% at TGE
    manualLinear(
      start + periodToSeconds.months(6), // 6 months lock-up
      start + periodToSeconds.months(6) + periodToSeconds.months(24), // 24 months vesting
      investorsFundingPreseed * 0.9625 // 96.25% vested
    ),
  ],
  
  "Investors (Seed)": [
    manualCliff(start, investorsFundingSeed * 0.0625), // 6.25% at TGE
    manualLinear(
      start + periodToSeconds.months(6), // 6 months lock-up
      start + periodToSeconds.months(6) + periodToSeconds.months(24), // 24 months vesting
      investorsFundingSeed * 0.9375 // 93.75% vested
    ),
  ],
  
  "Investors (Private and Pre-Launch)": [
    manualCliff(start, investorsFundingPrivate * 0.075 + investorsFundingPreLaunch * 0.075), // 7.5% at TGE
    manualLinear(
      start + periodToSeconds.months(6), // 6 months lock-up
      start + periodToSeconds.months(6) + periodToSeconds.months(18), // 18 months vesting
      investorsFundingPrivate * 0.925 + investorsFundingPreLaunch * 0.925 // 92.5% vested
    ),
  ],
  
  "Community Sale": [
    manualCliff(start, communitySale * 0.1625), // 16.25% at TGE
    manualLinear(
      start,
      start + periodToSeconds.months(6),
      communitySale * 0.8375 // 83.75% vested over 6 months
    ),
  ],
  
  "Community Initial Campaign": manualCliff(start, communityInitial), // 100% at TGE
  
  "Community Campaigns (Get Real & Early Adopters)": [
    manualCliff(
      start + periodToSeconds.months(3),
      communityGetReal + communityEarlyAdopters
    ), // Full amount after 3 months
  ],
  
  "Community Reserve": manualCliff(start, communityReserve),
  
  "Core Contributors and EoT Labs": [
    manualLinear(
      start + periodToSeconds.months(9), // 9 months lock-up
      start + periodToSeconds.months(9) + periodToSeconds.months(36), // 36 months vesting
      coreContributors + eotLabs // Total amount
    ),
  ],
  
  meta: {
    token: "coingecko:peaq-2",
    sources: ["https://docs.peaq.xyz/learn/tokenomics#tokenomics"],
    protocolIds: ["6035"],
    notes: [
      "Grouped Ecosystem Market Making & Liquidity, Ecosystem Reserves, Capital Contributions, Grants, and Expansion as 'Ecosystem Funds'"
    ]
  },

  categories: {
    noncirculating: ["Community Reserve","Network Security","Ecosystem Funds"],
    liquidity: ["Ecosystem Market Making & Liquidity"],
    publicSale: ["Community Sale","Community Initial Campaign","Community Campaigns (Get Real & Early Adopters)"],
    privateSale: ["Investors (Pre Seed)","Investors (Seed)","Investors (Private and Pre-Launch)"],
    insiders: ["Core Contributors and EoT Labs"],
  },
};

export default peaq;