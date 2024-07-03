import { Protocol } from "../types/adapters";
import { manualLinear, manualCliff } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const total = 1_000_000_000; // 1 billion
const start = 1714435200;

const commonwealth: Protocol = {
  "Genesis NFT Series 1": manualLinear(
    start,
    start + periodToSeconds.years(2),
    total * 0.088,
  ),
  "Genesis NFT Series 2": manualLinear(
    start,
    start + periodToSeconds.years(2),
    total * 0.022,
  ),
  "Genesis NFT Series 1 Bonus": manualLinear(
    start,
    start + periodToSeconds.years(2),
    total * 0.003,
  ),
  "Strategic Partners Round 1": [
    manualCliff(start + periodToSeconds.months(6), total * 0.0696 * 0.1),
    manualLinear(
      start + periodToSeconds.months(6),
      start + periodToSeconds.months(18),
      total * 0.0696 * 0.9,
    ),
  ],
  "Strategic Partners Round 2": [
    manualCliff(start, total * 0.0153 * 0.05),
    manualLinear(
      start,
      start + periodToSeconds.months(18),
      total * 0.0153 * 0.95,
    ),
  ],
  "NFT Staking Rewards": manualCliff(start, total * 0.0246),
  Airdrop: manualCliff(start + periodToSeconds.month, total * 0.035),
  "Public Sale": [
    manualCliff(start, total * 0.15 * 0.1),
    manualLinear(
      start + periodToSeconds.month,
      start + periodToSeconds.months(7),
      total * 0.15 * 0.9,
    ),
  ],
  Marketing: [
    manualCliff(start + periodToSeconds.month, total * 0.0922 * 0.3),
    manualLinear(
      start + periodToSeconds.months(6),
      start + periodToSeconds.months(30),
      total * 0.0922 * 0.7,
    ),
  ],
  Advisors: manualLinear(
    start + periodToSeconds.months(3),
    start + periodToSeconds.months(27),
    total * 0.0503,
  ),
  Team: [
    manualCliff(start + periodToSeconds.months(9), total * 0.14 * 0.1),
    manualLinear(
      start + periodToSeconds.months(9),
      start + periodToSeconds.months(33),
      total * 0.14 * 0.9,
    ),
  ],
  Treasury: manualLinear(
    start + periodToSeconds.month,
    start + periodToSeconds.months(18),
    total * 0.14,
  ),
  "Rewards & Incentives": [
    manualCliff(start + periodToSeconds.month, total * 0.05 * 0.05),
    manualLinear(
      start + periodToSeconds.month,
      start + periodToSeconds.months(13),
      total * 0.05 * 0.95,
    ),
  ],
  "Exchanges & Liquidity": manualCliff(start, total * 0.1),
  "Community Fund Bootstrap": manualCliff(
    start + periodToSeconds.months(4),
    total * 0.02,
  ),
  meta: {
    sources: ["https://joincommonwealth.xyz/whitepaper"],
    token: "coingecko:common-wealth",
    protocolIds: [""],
  },
  categories: {
    farming: ["NFT Staking Rewards", "Rewards & Incentives"],
    airdrop: ["Airdrop"],
    publicSale: ["Public Sale", "Exchanges & Liquidity"],
    insiders: [
      "Strategic Partners Round 1",
      "Strategic Partners Round 2",
      "Marketing",
      "Advisors",
      "Team",
      "Treasury",
    ],
    noncirculating: ["Community Fund Bootstrap"],
  },
};

export default commonwealth;
