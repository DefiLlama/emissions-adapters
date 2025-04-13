import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1744243200; // April 10, 2025, 10AM UTC
const totalSupply = 10_000_000_000;

// Allocation amounts
const communityIncentives = totalSupply * 0.15;
const ecosystemBuilding = totalSupply * 0.18;
const researchDevelopment = totalSupply * 0.18;
const investors = totalSupply * 0.305;
const team = totalSupply * 0.15;
const advisors = totalSupply * 0.035;

const babylon: Protocol = {
  "Community Incentives": manualCliff(start, communityIncentives),
  
  "Research and Development + Operations": [
    manualCliff(start, researchDevelopment * 0.25),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      researchDevelopment * 0.75
    )
  ],

  "Ecosystem Building": [
    manualCliff(start, ecosystemBuilding * 0.25),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      ecosystemBuilding * 0.75
    )
  ],

  "Early Private-Round Investors": [
    manualCliff(start + periodToSeconds.year, investors * 0.125),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      investors * 0.875
    )
  ],

  "Team": [
    manualCliff(start + periodToSeconds.year, team * 0.125),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      team * 0.875
    )
  ],

  "Advisors": [
    manualCliff(start + periodToSeconds.year, advisors * 0.125),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      advisors * 0.875
    )
  ],

  meta: {
    token: "coingecko:babylon",
    sources: ["https://babylon.foundation/blogs/baby-tokenomics-guide"],
    protocolIds: ["5258"],
    notes: [
      "Total supply of 10 billion BABY tokens at genesis",
      "Max supply is infinite, but 10 billion is the initial supply",
      "In this analysis we assumed that community incentives are unlocked at TGE similar to chart provided in the blog post",
    ]
  },

  categories: {
    insiders: [
      "Team",
      "Advisors",
      "Early Private-Round Investors"
    ],
    noncirculating: [
      "Community Incentives",
      "Ecosystem Building",
      "Research and Development + Operations"
    ],
  },
};

export default babylon;