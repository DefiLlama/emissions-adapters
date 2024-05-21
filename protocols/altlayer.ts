import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const chain = "ethereum";
const address = "0x8457ca5040ad67fdebbcc8edce889a335bc0fbfb";
const start = 1706227200;
const total = 1e10;

const altlayer: Protocol = {
  "Binance Launchpool": manualCliff(start, total * 0.05),
  Team: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.years(4),
    total * 0.15,
  ),
  Investors: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.years(3),
    total * 0.185,
  ),
  Advisors: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.years(3),
    total * 0.05,
  ),
  "Protocol Development": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.2,
  ),
  "Ecosystem & Community": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.15,
  ),
  Treasury: manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.215,
  ),
  meta: {
    sources: ["https://www.binance.com/en/research/projects/altlayer"],
    token: `${chain}:${address}`,
    protocolIds: ["4641"],
  },
  categories: {
    publicSale: ["Binance Launchpool"],
    insiders: ["Team", "Investors", "Advisors", "Protocol Development"],
    farming: ["Ecosystem & Community"],
    noncirculating: ["Treasury"],
  },
};
export default altlayer;
