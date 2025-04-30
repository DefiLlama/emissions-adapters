import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1713916800;
const total = 1e10;

const renzo: Protocol = {
  Fundraising: [
    manualCliff(start + periodToSeconds.year, total * 0.3156 * 0.1),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      12,
      (total * 0.3156 * 0.9) / 12,
    ),
  ],
  Community: [
    manualCliff("2024-04-30", total * 0.07),
    manualCliff("2024-07-30", total * 0.05),
    manualLinear("2024-07-30", "2028-07-30", total * 0.2),
  ],
  "Core Contributors": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    24,
    (total * 0.2) / 24,
  ),
  Foundation: manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.1244,
  ),
  "Binance Launch Pool": manualCliff(start, total * 0.025),
  Liquidity: manualCliff(start, total * 0.015),
  meta: {
    token: `ethereum:0x3b50805453023a91a8bf641e279401a0b23fa6f9`,
    sources: ["https://docs.renzoprotocol.com/docs/renzo/rez/rez-tokenomics"],
    notes: [
      `No details are given regarding the Foundation schedule, so in this analysis we have assumed a 4 year linear vesting.`,
      `No details are given for 20% of the total supply, reserved for community campaigns. Therefore we have assumed a 4 year linear vesting.`,
    ],
    protocolIds: ["3933"],
  },
  categories: {
    publicSale: ["Binance Launch Pool","Liquidity"],
    farming: ["Community"],
    privateSale: ["Fundraising"],
    insiders: ["Core Contributors","Foundation"],
  },
};

export default renzo;
