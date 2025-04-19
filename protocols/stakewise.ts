import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1617235200; // April 1, 2021
const totalSupply = 1_000_000_000;

const community = totalSupply * 0.51;      // 510,000,000 SWISE
const investors = totalSupply * 0.2515;    // 251,500,000 SWISE
const team = totalSupply * 0.217;          // 217,000,000 SWISE
const futureFundraise = totalSupply * 0.0215; // 21,500,000 SWISE

const swise: Protocol = {
  "Community": manualLinear(
    start,                                             // Start immediately
    start + periodToSeconds.years(4),                  // 4 year vesting
    community
  ),

  "Future Fundraise": manualCliff(start, futureFundraise), // Available immediately


  "Investors": manualLinear(
    start + periodToSeconds.months(6),                 // 6 month cliff
    start + periodToSeconds.months(24),                // 18 month vesting after cliff
    investors
  ),

  "Team": manualLinear(
    start + periodToSeconds.months(6),                 // 6 month cliff
    start + periodToSeconds.months(48),                // 42 month vesting after cliff
    team
  ),


  meta: {
    token: "ethereum:0x48c3399719b582dd63eb5aadf12a40b4c3f52fa2",
    sources: ["https://docs.stakewise.io/governance/stakewise-dao#tokenomics"],
    protocolIds: ["parent#stakewise"],
    notes: [
      "Community allocation vests linearly over 4 years from TGE",
      "Investors have a 6-month cliff followed by 18-month linear vesting",
      "Team has a 6-month cliff followed by 42-month linear vesting",
      "Future Fundraise allocation is available immediately at TGE"
    ]
  },

  categories: {
    insiders: [
      "Team",
      "Investors",
    ],
    noncirculating: [
      "Future Fundraise",
    ],
    liquidity: [],
    farming: [
      "Community",
    ],
  },
};

export default swise;
