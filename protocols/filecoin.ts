import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1729123200;
const totalSupply = 2_000_000_000;

// Allocation amounts
const baselineMint = totalSupply * 0.385;
const simpleMint = totalSupply * 0.165;
const protocolLabs = totalSupply * 0.105;
const miningRewards = totalSupply * 0.15;
const filecoinFoundation = totalSupply * 0.05;
const protocolLabsTeam = totalSupply * 0.045;
const fundraising6Months = totalSupply * 0.022;
const fundraising12Months = totalSupply * 0.015;
const fundraising24Months = totalSupply * 0.005;
const fundraising36Months = totalSupply * 0.058;


const uxlink: Protocol = {
  "Baseline Minting": 
   manualLinear(
    start,
    start + periodToSeconds.years(20),
    baselineMint,
   ),

  "Simple Minting": [
  manualLinear(
    start,
    start + periodToSeconds.years(6),
    simpleMint * 0.5,  // First 6 years: 50% of tokens
  ),
  manualLinear(
    start + periodToSeconds.years(6),
    start + periodToSeconds.years(12),
    simpleMint * 0.25,  // Second 6 years: 25% of tokens
  ),
  manualLinear(
    start + periodToSeconds.years(12),
    start + periodToSeconds.years(18),
    simpleMint * 0.125,  // Third 6 years: 12.5% of tokens
  ),
  manualLinear(
    start + periodToSeconds.years(18),
    start + periodToSeconds.years(24),
    simpleMint * 0.0625,  // Fourth 6 years: 6.25% of tokens
  ),
  manualLinear(
    start + periodToSeconds.years(24),
    start + periodToSeconds.years(30),
    simpleMint * 0.03125,  // Fifth 6 years: 3.125% of tokens
  ),
  manualLinear(
    start + periodToSeconds.years(30),
    start + periodToSeconds.years(36),
    simpleMint * 0.03125,  // Sixth 6 years: remaining 3.125% of tokens
  ),
],

  "Protocol Labs":
    manualLinear(
      start,
      start + periodToSeconds.years(6),
      protocolLabs,
    ),

  "Protocol Labs Team & Contributors":
  manualLinear(
    start,
    start + periodToSeconds.years(6),
    protocolLabsTeam,
  ),

  "Fundraising 6 Months":
    manualLinear(
      start,
      start + periodToSeconds.months(6),
      fundraising6Months,
    ),
  
  "Fundraising 12 Months":
    manualLinear(
      start,
      start + periodToSeconds.months(12),
      fundraising12Months,
    ),

  "Fundraising 24 Months":
    manualLinear(
      start,
      start + periodToSeconds.months(24),
      fundraising24Months,
    ),

  "Fundraising 36 Months":
    manualLinear(
      start,
      start + periodToSeconds.months(36),
      fundraising36Months,
    ),

    "Filecoin Foundation":
    manualLinear(
      start,
      start + periodToSeconds.years(6),
      filecoinFoundation,
    ),


  
  meta: {
    token: "coingecko:filecoin",
    sources: ["https://filecoin.io/blog/filecoin-circulating-supply/", "https://coinlist.co/assets/index/filecoin_2017_index/Filecoin-Sale-Economics-e3f703f8cd5f644aecd7ae3860ce932064ce014dd60de115d67ff1e9047ffa8e.pdf"],
    protocolIds: ["6038"],
    notes: [
      "Because Mining Reserve are reserved we don't include them in the calculation.",
      "Baseline Minting are assumed to be linear for simplicity",
      "Simple Minting are assumed to be linear with the supply getting halved every 6 years",
    ]
  },

  categories: {
    insiders: [
      "Fundraising 6 Months",
      "Fundraising 12 Months",
      "Fundraising 24 Months",
      "Fundraising 36 Months",
      "Protocol Labs",
      "Protocol Labs Team & Contributors",
    ],
    noncirculating: [
      "Filecoin Foundation",
    ],
    farming: [
      "Baseline Minting",
      "Simple Minting",
    ],
  },
};

export default uxlink;