import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1722902400;
const totalSupply = 1_000_000_000;

const airdrop = totalSupply * 0.2;
const ecosystem = totalSupply * 0.17;
const team = totalSupply * 0.15;
const marketing = totalSupply * 0.15;
const protocol = totalSupply * 0.15;
const fairLaunch = totalSupply * 0.08;
const voterIncentives = totalSupply * 0.05;
const initialLiquidity = totalSupply * 0.05;

const cellana: Protocol = {
  "Voter Incentives": manualCliff(
    start,
    voterIncentives,
  ),
  "Initial Liquidity": manualCliff(
    start,
    initialLiquidity,
  ),
  "Fair Launch": [
    manualCliff(
      start,
      fairLaunch * 0.25,
    ),
    manualStep(
      start,
      periodToSeconds.months(3),
      3,
      fairLaunch * 0.25,
    )
  ],
  "Marketing": [
    manualCliff(
      start + periodToSeconds.months(3),
      marketing * 0.5,
    ),
    manualCliff(
      start + periodToSeconds.months(6),
      marketing * 0.5,
    )
  ],
  "Airdrop": manualStep(
    start,
    periodToSeconds.month,
    24,
    airdrop / 24,
  ),
  "Ecosystem Grant": manualStep(
    start,
    periodToSeconds.month,
    12,
    ecosystem / 12,
  ),
  "Team": manualStep(
    start,
    periodToSeconds.month,
    24,
    team / 24,
  ),
  "Protocol": manualStep(
    start,
    periodToSeconds.month,
    24,
    protocol / 24,
  ),


  meta: {
    token: "coingecko:cellana-finance",
    sources: ["https://docs.cellana.finance/tokenomics/protocol-tokens"],
    protocolIds: ["4194"],
    notes: ["We assume that Airdrop, Ecosystem Grant, Team and Protocol unlock monthly, the documentation doesn't have any information on this"],
  },

  categories: {
    publicSale: ["Fair Launch"],
    insiders: ["Team"],
    farming: ["Voter Incentives"],
    airdrop: ["Airdrop"],
    liquidity: ["Initial Liquidity"],
    noncirculating: ["Ecosystem Grant", "Protocol", "Marketing"],
  }
};

export default cellana;
