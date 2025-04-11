import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1743033600; // March 27, 2025
const totalSupply = 5_000_000_000;

// Allocation amounts
const communityReserve = totalSupply * 0.43;
const userDrop = totalSupply * 0.10;
const subsidies = totalSupply * 0.10;
const earlyContributor = totalSupply * 0.20;
const mystenLabs = totalSupply * 0.10;
const investors = totalSupply * 0.07;

const walrus: Protocol = {
  "Walrus User Drop": manualCliff(start, userDrop),
  
  "Investors": manualCliff(start + periodToSeconds.year, investors),

  "Mysten Labs": [
    manualCliff(start, 50_000_000),
    manualLinear(
      start,
      start + periodToSeconds.years(8),
      mystenLabs - 50_000_000
    )
  ],

  "Subsidies":
    manualLinear(
      start,
      start + periodToSeconds.months(50),
      subsidies
    ),

  "Community Reserve": [
    manualCliff(start, 690_000_000), // 690M at launch
    manualLinear(
      start,
      start + periodToSeconds.years(8),
      communityReserve - 690_000_000 // Remaining amount after initial unlock
    )
  ],

  "Early Contributor":
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      earlyContributor
    ),

  meta: {
    token: "coingecko:walrus-2",
    sources: ["https://www.walrus.xyz/wal-token"],
    protocolIds: ["6032"],
  },

  categories: {
    insiders: [
      "Investors",
      "Mysten Labs",
      "Early Contributor"
    ],
    noncirculating: [
      "Subsidies",
      "Community Reserve"
    ],
    airdrop: ["Walrus User Drop"]
  },
};

export default walrus;
