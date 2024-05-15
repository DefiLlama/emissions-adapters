import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1672704000;
const total = 1e9;

const unlock = (
  percentage: number,
  tge: number,
  lock: number,
  months: number,
) => [
  manualStep(
    start + periodToSeconds.months(lock),
    periodToSeconds.month,
    months,
    (percentage * 0.01 * total * (1 - tge * 0.01)) / months,
  ),
  manualCliff(start, percentage * 0.01 * tge * 0.01 * total),
];

const cheelee: Protocol = {
  "Strategic Round 1": unlock(0.2, 0, 48, 18),
  "Strategic Round 2": unlock(0.15, 0, 48, 18),
  "Private Round": unlock(0.05, 0, 36, 18),
  "Community Drop": unlock(0.125, 6, 4, 36),
  Team: unlock(10, 0, 36, 36),
  Liquidity: unlock(10, 5, 0, 36),
  Marketing: unlock(28.625, 5, 0, 36),
  "Cheelee Rewards": unlock(38.1, 0, 0, 36),
  "Reserve Fund": unlock(12.25, 0, 36, 36),
  Advisors: unlock(0.5, 0, 36, 24),
  meta: {
    token: `coingecko:cheelee`,
    sources: ["https://static.cheeleepay.com/files/en_US/tokenomics.pdf"],
    protocolIds: [""],
  },
  categories: {
    insiders: [
      "Strategic Round 1",
      "Strategic Round 2",
      "Private Round",
      "Team",
      "Advisors",
    ],
    airdrop: ["Community Drop"],
    publicSale: ["Liquidity"],
    farming: ["Cheelee Rewards"],
    noncirculating: ["Reserve Fund", "Marketing"],
  },
};

export default cheelee;
