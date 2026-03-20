import { CliffAdapterResult, Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { queryDuneSQLCached } from "../utils/dune";

const start = 1721260800;
const totalSupply = 1_000_000_000; // 1B total supply

// Allocation amounts
const launchLiquidity = totalSupply * 0.20;  // 20%
// const communityReserve = totalSupply * 0.30; // 30%
const strategicReserve = totalSupply * 0.11; // 11%
const team = totalSupply * 0.25;            // 25%
const investors = totalSupply * 0.13;       // 13%
const jupLfg = totalSupply * 0.01;         // 1%

// Launch liquidity split
const initialAirdrop = launchLiquidity * 0.5;  // 10% of total supply
const launchPool = launchLiquidity * 0.5;      // 10% of total supply

const communityReserve = async (): Promise<CliffAdapterResult[]> => {
  return await queryDuneSQLCached(`
    SELECT 
      to_unixtime(block_date) AS date,
      amount_display AS amount 
    FROM tokens_solana.transfers
    WHERE from_token_account IN ('Ay1sXM9gG1ZFARXr1TowweUyhbZrj3BMcX5Zb4HgbcKr', '9uyCjS84BfeF56WbANu2xHFtrjTe7GsSpLzMJ4adWNXY')
      AND block_date >= START
    ORDER BY block_date
`, 1721174400, {protocolSlug: "sanctum", allocation: "Community Reserve"})
}

const cloud: Protocol = {
  "Strategic Reserve": manualCliff(start, strategicReserve),
  "Initial Airdrop": manualCliff(start, initialAirdrop),
  
  "Launch Pool": manualCliff(start, launchPool),

  "Jup LFG": manualCliff(start, jupLfg),

  "Team": [
    manualCliff(
      start + periodToSeconds.year,
      team * 0.33 // 33% after 1 year cliff
    ),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      team * 0.67 // 67% over next 2 years
    )
  ],

  "Investors": [
    manualCliff(
      start + periodToSeconds.year,
      investors * 0.33 // 33% after 1 year cliff
    ),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      investors * 0.67 // 67% over next 2 years
    )
  ],

  "Community Reserve": communityReserve,

  meta: {
    token: "solana:CLoUDKc4Ane7HeQcPpE3YHnznRxhMimJ4MyaUqyHFzAu",
    sources: ["https://learn.sanctum.so/blog/cloud-the-sanctum-governance-token"],
    protocolIds: ["parent#sanctum"],
    notes: [
      "Strategic Reserve (11%) are non-circulating",
      "Community Reserve (30%) are assumed to be incentives, we use token outflow data to track",
      "Team and investor tokens have 1 year cliff with 33% unlock, then 67% linear vesting over 2 years",
      "Launch liquidity is split between initial airdrop (10%) and LFG launch pool (10%)"
    ]
  },

  categories: {
    publicSale: ["Launch Pool"],
    airdrop: ["Initial Airdrop","Jup LFG"],
    noncirculating: ["Strategic Reserve"],
    farming: ["Community Reserve"],
    privateSale: ["Investors"],
    insiders: ["Team"],
  }
};

export default cloud;
