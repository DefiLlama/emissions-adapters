import { Protocol } from "../types/adapters";
import { manualStep, manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 1_000_000_000;
const start = 1639785600;

const moonbeam: Protocol = {
  "Seed funding": manualStep(1600815600 + periodToSeconds.month * 3, periodToSeconds.month, 21, qty * 0.14 / 21),
  "Strategic funding": manualStep(1617058800, periodToSeconds.month, 10, qty * 0.12 / 10),
  "Take Flight community event": manualCliff(1631023200, 98_211_164),
  "2021 Moonbeam crowdloan": [
    manualCliff(start, qty * 0.15 * 0.3), 
    manualLinear(start, start + periodToSeconds.week * 96, qty * 0.15 * 0.7)
  ],
  //"Parachain Bond funding": 0.5%
  //"Parachain Bond reserve": 0.5%
  // "Long term protocol & ecosystem development": 16.7%
  "Liquidity programs": manualLinear(1648767600, 1664578800, qty * 0.015),
  "Developer adoption program": manualStep(start, periodToSeconds.month, 24, qty * 0.0355 / 24),
  "Key partners and advisors": [
    manualStep(start + periodToSeconds.month * 7, periodToSeconds.month, 17, 39_468_300 / (3 * 17)),
    manualStep(start + periodToSeconds.month * 2, periodToSeconds.month, 10, 39_468_300 / (3 * 10)),
    manualStep(start + periodToSeconds.month * 3, periodToSeconds.month, 21, 39_468_300 / (3 * 21)),
  ],
  "PureStake early backers": manualStep(start + periodToSeconds.month * 7, periodToSeconds.month, 17, qty * 0.014 / 17),
  "Founders and early employees": [
    manualCliff(start + periodToSeconds.year, qty * 0.025), 
    manualStep(start + periodToSeconds.year, periodToSeconds.month, 36, qty * 0.075 / 36)
  ],
  "Future employee incentives": [
    manualCliff(start + periodToSeconds.year, qty * 0.046 / 4), 
    manualStep(start + periodToSeconds.year, periodToSeconds.month, 36, qty * 0.046 * 3 / (36 * 4))
  ],
  notes: [
    `Parachain Bond funding and reserve (totalling 1%) act as a backstop to ensure that the parachain slot continues to be funded. Therefore there is no planned emission schedule and this section has been excluded from this analysis.`,
    `Long term protocol & ecosystem development (16.7%) has no defined emission schedule and thereofre has been excluded from this analysis.`,
    `70% of Liquidity programs emissions (about 3% of total) are unaccounted for an have therefore been excluded from this analysis.`
  ],
  sources: ["https://moonbeam.foundation/glimmer-token/"],
  token: "coingecko:moonbeam",
  protocolIds: [""],
};

export default moonbeam;