import { Protocol } from "../types/adapters";
import { manualStep, manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const maxSupply = 1_000_000_000;
const start = 1673395200;

const moonbeam: Protocol = {
  "Ecosystem Development": manualCliff(
    start - periodToSeconds.year,
    (166_770_536 / maxSupply) * 100,
  ),
  "Liquidity Programs": manualCliff(
    start - periodToSeconds.year,
    (50_000_000 / maxSupply) * 100,
  ),
  "Parachain Bond Funding": manualCliff(
    start - periodToSeconds.year,
    (30_000_000 / maxSupply) * 100,
  ),
  "Parachain Bond Reserve": manualCliff(
    start - periodToSeconds.year,
    (5_000_000 / maxSupply) * 100,
  ),
  "Treasury": manualCliff(
    start - periodToSeconds.year,
    (5_000_000 / maxSupply) * 100,
  ),
  "Take Flight Community Event": manualCliff(
    start - periodToSeconds.month * 2,
    (98_211_164 / maxSupply) * 100,
  ),
  "Strategic Funding": manualCliff(
    start - periodToSeconds.month,
    (12_000_000 / maxSupply) * 100,
  ),
  "2021 Moonbeam Crowdloan": manualLinear(
    start,
    start + (periodToSeconds.year / 12) * 10,
    (100_937_500 / maxSupply) * 100,
  ),
  "PureStake Early Backers": manualStep(
    start,
    periodToSeconds.day * 30,
    17,
    (823_529 / maxSupply) * 100,
  ),
  "Key Partners & Advisors": manualStep(
    start,
    periodToSeconds.day * 30,
    18,
    (2_192_683 / maxSupply) * 100,
  ),
  "Seed Funding": manualStep(
    start,
    periodToSeconds.day * 30,
    21,
    (6_666_667 / maxSupply) * 100,
  ), 
  "Developer Adoption Program": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    (35_550_000 / maxSupply) * 100,
  ),
  "Future Employee Incentives": manualStep(
    start,
    periodToSeconds.day * 30,
    37,
    (958_333 / maxSupply) * 100,
  ),
  "Founders and Early Employees": manualStep(
    start,
    periodToSeconds.day * 30,
    37,
    (2_083_333 / maxSupply) * 100,
  ),  
  sources: ["https://moonbeam.foundation/glimmer-token/"],
  token: "moonbeam:TOKEN_ADDRESS_HERE",
  protocolIds: [""],
};

export default moonbeam;