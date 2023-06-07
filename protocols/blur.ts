import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const schedule = (cliffQty: number, percentageOfTotalSupply: number) => [
  manualCliff(
    start + 4 * periodToSeconds.month,
    qty * percentageOfTotalSupply * cliffQty,
  ),
  manualLinear(
    start,
    start + periodToSeconds.year,
    qty * percentageOfTotalSupply * (0.4 - cliffQty),
  ),
  manualLinear(
    start + periodToSeconds.year,
    start + 2 * periodToSeconds.year,
    qty * percentageOfTotalSupply * 0.3,
  ),
  manualLinear(
    start + 2 * periodToSeconds.year,
    start + 3 * periodToSeconds.year,
    qty * percentageOfTotalSupply * 0.2,
  ),
  manualLinear(
    start + 3 * periodToSeconds.year,
    start + 4 * periodToSeconds.year,
    qty * percentageOfTotalSupply * 0.1,
  ),
];
const start = 1675191600;
const qty = 3000000000;
const blur: Protocol = {
  airdrop: manualCliff(start, qty * 0.12),
  "community treasury": schedule(0, 0.39),
  advisors: schedule(0.33, 0.012),
  contributors: schedule(0.33, 0.29),
  investors: schedule(0.33, 0.188),
  meta: {
    token: "ethereum:0x5283d291dbcf85356a21ba090e6db59121208b44",
    sources: ["https://docs.blur.foundation/tokenomics"],
    notes: [
      "advisor allocation vests over 48-60 months with a 4-16 month cliff. Here we've used a pessimistic assumption that all advisor allocation unlocks on a 4 month cliff and 48 month vesting",
    ],
    protocolIds: ["2414"],
  },
  categories: {
    airdrop: ["airdrop"],
    noncirculating: ["community treasury"],
    insiders: ["advisors", "contributors", "investors"],
  },
};

export default blur;
