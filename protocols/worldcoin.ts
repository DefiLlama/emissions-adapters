import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

// July 24, 2023
const start = 1690156800;
const totalSupply = 10_000_000_000;

// Allocation amounts
const community = totalSupply * 0.75;      // 75.0% - Community
const team = totalSupply * 0.10;           // 10.0% - Initial Development Team
const investors = totalSupply * 0.138;     // 13.8% - TFH Investors
const reserve = totalSupply * 0.012;       // 1.2% - TFH Reserve

// Initial launch amount for community
const initialCommunityAmount = 500_000_000; // 0.5B at launch
const year3 = start + periodToSeconds.years(3);
const year6 = start + periodToSeconds.years(6);
const year9 = start + periodToSeconds.years(9);
const year15 = start + periodToSeconds.years(15);

const communityYear3Target = 4_000_000_000;  // 4.0B by year 3
const communityYear6Target = 5_750_000_000;  // 5.75B by year 6
const communityYear9Target = 6_625_000_000;  // 6.625B by year 9
const communityYear15Target = 7_500_000_000; // 7.5B by year 15

const worldcoin: Protocol = {
  "Worldcoin Community": [
    // Initial launch amount
    manualCliff(start, initialCommunityAmount),

    // Phase 1: Launch to Year 3 (4.0B target)
    manualLinear(
      start,
      year3,
      communityYear3Target - initialCommunityAmount
    ),

    // Phase 2: Year 4-6 (5.75B target)
    manualLinear(
      year3,
      year6,
      communityYear6Target - communityYear3Target
    ),

    // Phase 3: Year 7-9 (6.625B target)
    manualLinear(
      year6,
      year9,
      communityYear9Target - communityYear6Target
    ),

    // Phase 4: Year 10-15 (7.5B target)
    manualLinear(
      year9,
      year15,
      communityYear15Target - communityYear9Target
    )
  ],

  "TFH Reserve": manualCliff(start, reserve),

  "Initial Development Team": [
    // 20% on original 3-year schedule (1 year cliff + 2 year linear)
    manualCliff(
      start + periodToSeconds.year,
      team * 0.2 * 0.333 // 33.3% cliff after 1 year
    ),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      team * 0.2 * 0.667 // 66.7% over 2 years after cliff
    ),

    // 80% on extended 5-year schedule
    manualCliff(
      start + periodToSeconds.year,
      team * 0.8 * 0.333 // 33.3% cliff after 1 year
    ),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(5),
      team * 0.8 * 0.667 // 66.7% over 4 years after cliff
    )
  ],

  "TFH Investors": [
    // 20% on original 3-year schedule (1 year cliff + 2 year linear)
    manualCliff(
      start + periodToSeconds.year,
      investors * 0.2 * 0.333 // 33.3% cliff after 1 year
    ),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      investors * 0.2 * 0.667 // 66.7% over 2 years after cliff
    ),

    // 80% on extended 5-year schedule
    manualCliff(
      start + periodToSeconds.year,
      investors * 0.8 * 0.333 // 33.3% cliff after 1 year
    ),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(5),
      investors * 0.8 * 0.667 // 66.7% over 4 years after cliff
    )
  ],

  meta: {
    token: "coingecko:worldcoin-wld",
    sources: [
      "https://whitepaper.world.org/#introducing-wld",
    ],
    protocolIds: ["4612"],
    notes: [
      "Community allocation follows a phased distribution reaching 7.5B by year 15",
      "80% of team and investor tokens have vesting extended from 3 to 5 years",
      "TFH Reserve (1.2%) is locked for at least as long as team/investor tokens"
    ]
  },

  categories: {
    insiders: [
      "Initial Development Team",
      "TFH Investors"
    ],
    noncirculating: [
      "TFH Reserve"
    ],
    farming: [
      "Worldcoin Community"
    ]
  }
};

export default worldcoin;
