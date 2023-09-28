import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 100e6;
const start = 1665961200;

const wombex: Protocol = {
  "Private Sale": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    qty * 0.1,
  ),
  "Pancake Swap IFO": [
    manualCliff(start, qty * 0.04 * 0.2),
    manualLinear(start, start + periodToSeconds.day * 90, qty * 0.04 * 0.8),
  ],
  "Syrup Pool": manualLinear(
    start,
    start + periodToSeconds.day * 60,
    qty * 0.01,
  ),
  "Wombat Wars Reward Incentives": [
    manualLinear(start, start + periodToSeconds.month, qty * 0.029),
    manualLinear(
      start + periodToSeconds.month,
      start + periodToSeconds.month * 6,
      qty * 0.068,
    ),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year,
      qty * 0.099,
    ),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.year * 2,
      qty * 0.099,
    ),
    manualLinear(
      start + periodToSeconds.year * 2,
      start + periodToSeconds.year * 4,
      qty * 0.099,
    ),
    manualLinear(
      start + periodToSeconds.year * 4,
      start + periodToSeconds.year * 8,
      qty * 0.106,
    ),
  ],
  "Community Treasury": [
    manualCliff(start, qty * 0.02 * 0.025),
    manualLinear(start, start + periodToSeconds.year * 2, qty * 0.02 * 0.975),
  ],
  "Liquidity Mining": [
    manualCliff(start, qty * 0.1 * 0.05),
    manualLinear(start, start + periodToSeconds.year * 4, qty * 0.1 * 0.95),
  ],
  Team: manualLinear(start, start + periodToSeconds.year * 2, qty * 0.135),
  "Liquidity Provision, Market Making, Marketing": [
    manualCliff(start, (qty * 0.035) / 3),
    manualLinear(start, start + periodToSeconds.year, (qty * 0.07) / 3),
  ],
  "Wombat Whitelisting & Treasury": manualStep(
    start,
    periodToSeconds.month * 4,
    6,
    qty * 0.005,
  ),
  "WOM Wars Bootstrap Event": manualCliff(
    start + periodToSeconds.week * 16,
    qty * 0.02,
  ),
  Airdrop: manualCliff(start + periodToSeconds.week * 16, qty * 0.01),
  meta: {
    sources: ["https://docs.wombex.finance/wmx-token/distribution"],
    notes: [
      `WOM Wars Bootstrap LPs had the option to withdraw immediately with a 30% penalty or wait 16 weeks to redeem. Since we don't know specifics, in this analysis we have assumed everyone waited 16 weeks.`,
      `Wombat Wars Reward Incentives have been estimated since we could not find detailed information on their unlock schedule.`,
    ],
    token: "ethereum:0xa0ef786bf476fe0810408caba05e536ac800ff86",
    protocolIds: ["2226"],
  },
  categories: {
    airdrop: ["Airdrop"],
    publicSale: ["Pancake Swap IFO"],
    farming: [
      "Syrup Pool",
      "Wombat Wars Reward Incentives",
      "Liquidity Mining",
      "WOM Wars Bootstrap Event",
    ],
    noncirculating: ["Community Treasury", "Wombat Whitelisting & Treasury"],
    insiders: ["Private Sale", "Liquidity Provision, Market Making, Marketing"],
  },
};

export default wombex;
