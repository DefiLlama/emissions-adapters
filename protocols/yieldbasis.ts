import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";
import { teamVesting, investorsVesting } from "../adapters/yieldbasis";

const tge = 1760533200; // October 15, 2025 13:00 UTC
const deploymentStart = 1757894400; // September 15, 2025 00:00 UTC
const total = 1e9;

const yieldbasis: Protocol = {
  // TGE Unlocks (ordered big to small)
  "Ecosystem Reserve TGE": manualCliff(tge, total * 0.05), // 50M at TGE
  "Public Sale": manualCliff(tge, total * 0.025), // 25M
  "Curve Governance": manualCliff(tge, total * 0.005), // 5M
  "Initial DEX Liquidity": manualCliff(tge, total * 0.00125), // 1.25M
  "Early LPs TGE": manualCliff(tge, 736862), // 736,862 at TGE

  // Vesting schedules (fetched from on-chain contracts)
  "Team": teamVesting, // 250M, 2yr vesting with 6mo cliff from deployment
  "Investors": investorsVesting, // 121M, 2yr vesting with 6mo cliff from deployment

  // Manual vesting schedules
  "Ecosystem Reserve Vesting": manualLinear(
    tge,
    tge + periodToSeconds.years(2),
    total * 0.075, // 75M over 2 years
  ),
  "Protocol Development Reserve": manualLinear(
    deploymentStart + periodToSeconds.year, // 1-year cliff
    deploymentStart + periodToSeconds.years(2), // then 1-year linear
    total * 0.074, // 74M
  ),
  "Early LPs Vesting": manualLinear(
    tge,
    tge + periodToSeconds.year,
    total * 0.01125 - 736862, // Remaining after TGE unlock (~10.5M)
  ),
  "YB Pair Rewards": manualLinear(
    deploymentStart,
    deploymentStart + periodToSeconds.year,
    total * 0.0125, // 12.5M over 1 year
  ),
  "Liquidity Incentives": manualLinear(
    tge,
    tge + periodToSeconds.years(4),
    total * 0.30, // 300M over 4 years (simplified from dynamic formula)
  ),
  "Curve Licensing": manualLinear(
    tge,
    tge + periodToSeconds.years(4),
    total * 0.075, // 75M (dynamic, shown as linear approximation)
  ),

  meta: {
    notes: [
      "TGE occurred on October 15, 2025 at 13:00 UTC.",
      "Protocol deployment was September 15, 2025; vesting schedules for Team and Investors started from this date.",
      "Team and Investors vesting data is fetched from on-chain VestingEscrow contracts.",
      "Liquidity Incentives use a dynamic emission formula: Emax * sqrt(stake_rate). Shown as linear approximation over 4 years.",
      "Curve Licensing emissions are dynamic and dependent on staking rates; shown as linear approximation.",
      "Early vesting tokens (Team/Investors) are only claimable for locking into veYB before cliff ends.",
      "Early LPs allocation shown is for Season 1.",
    ],
    token: "ethereum:0x01791F726B4103694969820be083196cC7c045fF",
    sources: [
      "https://docs.yieldbasis.com/user/tokenomics",
      "https://docs.yieldbasis.com/user/inflation-emission",
      "https://docs.yieldbasis.com/dev/contract-addresses",
    ],
    protocolIds: ["6771"],
    total,
  },
  categories: {
    insiders: ["Team", "Investors"],
    noncirculating: [
      "Ecosystem Reserve TGE",
      "Ecosystem Reserve Vesting",
      "Protocol Development Reserve",
      "Curve Licensing",
    ],
    publicSale: ["Public Sale", "Initial DEX Liquidity"],
    farming: ["Liquidity Incentives", "YB Pair Rewards", "Curve Governance"],
    airdrop: ["Early LPs TGE", "Early LPs Vesting"],
  },
};

export default yieldbasis;
