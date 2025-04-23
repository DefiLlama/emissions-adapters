import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1600560000;
const totalSupply = 30_000_000_000; //initial supply

// Allocation amounts
const listing = totalSupply * 0.0067;             // 0.67%
const privatePlacement = totalSupply * 0.0488;     // 4.88%
const founders = totalSupply * 0.10;               // 10%
const veloDevReserve = totalSupply * 0.2333;      // 23.33%
const earlyBackers = totalSupply * 0.079;         // 7.90%
const strategicPartners = totalSupply * 0.1828;    // 18.28%
const communityDev = totalSupply * 0.1828;         // 18.28%
const reserve = totalSupply * 0.1667;              // 16.67%

const velo: Protocol = {
  "Listing": manualCliff(start, listing),

  "Private Placement": manualStep(
    start,
    periodToSeconds.months(6),
    4,
    privatePlacement * 0.25
  ),

  "Founders": [
    manualCliff(start + periodToSeconds.year, founders * 0.10),     // 10% at year 1
    manualCliff(start + periodToSeconds.years(2), founders * 0.10), // 10% at year 2
    manualCliff(start + periodToSeconds.years(3), founders * 0.25), // 25% at year 3
    manualCliff(start + periodToSeconds.years(4), founders * 0.25), // 25% at year 4
    manualCliff(start + periodToSeconds.years(5), founders * 0.30)  // 30% at year 5
  ],

  "Velo Development Reserve": [
    manualCliff(start + periodToSeconds.year, veloDevReserve * 0.10),     // 10% at year 1
    manualCliff(start + periodToSeconds.years(2), veloDevReserve * 0.10), // 10% at year 2
    manualCliff(start + periodToSeconds.years(3), veloDevReserve * 0.25), // 25% at year 3
    manualCliff(start + periodToSeconds.years(4), veloDevReserve * 0.25), // 25% at year 4
    manualCliff(start + periodToSeconds.years(5), veloDevReserve * 0.30)  // 30% at year 5
  ],

  "Early Backers and Advisors": manualStep(
    start,
    periodToSeconds.months(6),
    4,
    earlyBackers * 0.25
  ),

  "Strategic Partners": manualLinear(
    start,
    start + periodToSeconds.years(5),
    strategicPartners
  ),

  "Community Development": manualLinear(
    start,
    start + periodToSeconds.years(5),
    communityDev
  ),

  meta: {
    token: "bsc:0xf486ad071f3bee968384d2e39e2d8af0fcf6fd46",
    sources: ["https://web.archive.org/web/20201125054550/https://support.kucoin.plus/hc/en-us/articles/900002402363-Introduction-of-VELO-Token-Sale-on-KuCoin-Spotlight"],
    protocolIds: ["4989"],
    notes: [
      "Reserve allocation (16.67%) is perpetually locked therefore not included in this model",
      "Strategic Partners and Community Development follow a monthly linear release over 5 years",
      "Founders and Development Reserve follow a yearly unlock schedule",
      "We assume that community development are for liquidity mining rewards",
    ]
  },

  categories: {
    insiders: [
      "Founders",
      "Early Backers and Advisors",
      "Private Placement",
      "Strategic Partners",
    ],
    noncirculating: [
      "Velo Development Reserve",
    ],
    liquidity: [
      "Listing",
      "Strategic Partners"
    ],
    farming: [
      "Community Development"
    ]
  }
};

export default velo;
