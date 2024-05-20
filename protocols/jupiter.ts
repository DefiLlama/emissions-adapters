import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1706749200;
const total = 25e8;

const jupiter: Protocol = {
  Airdrop: manualCliff(start, 1e9),
  Team: [
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      total * 0.2,
    ),
  ],
  "Mercurial Stakeholders": manualCliff(
    start + periodToSeconds.year,
    total * 0.05,
  ),
  Launchpool: manualCliff(start, 25e7),
  "Market Makers": manualCliff(start, 5e7),
  "Immediate Needs": manualCliff(start, 5e7),
  DAO: manualLinear(start, start + periodToSeconds.months(14), 5e8),
  meta: {
    token: `coingecko:jupiter-exchange-solana`,
    sources: ["https://www.jupresear.ch/t/jup-the-genesis-post/478"],
    notes: [
      `550M of Team allocation has been excluded from this analysis since at the time of writing (20 May '24) the rate of spend was 0.`,
      `Team and DAO Hot Wallet schedules have been extrapolated based on their rate of spend as of 20 May '24.`,
      `No vesting schedule has been given for Mercurial Stakeholders, so in this analysis we have assumed an instant unlock.`,
    ],
    protocolIds: ["2141", "4077"],
  },
  categories: {
    noncirculating: ["DAO", "LFG Launchpad fees"],
    liquidity: ["Immediate Needs", "Market Makers"],
    publicSale: ["Launchpool"],
    airdrop: ["Airdrop"],
    insiders: ["Mercurial Stakeholders", "Team"],
  },
};

export default jupiter;
