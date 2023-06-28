import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const chain: any = "ethereum";
const ANKR: string = "0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4";
const convex: Protocol = {
  "Private Sale 1": manualCliff("2018-06-01", 300e6),
  "Private Sale 2": manualCliff("2018-07-01", 1200e6),
  "Private Sale 3": manualCliff("2018-08-01", 1500e6),
  "Public Sale": manualCliff("2018-09-22", 500e6),
  Marketing: manualCliff("2018-09-22", 500e6),
  Team: manualLinear("2019-10-01", "2022-09-01", 1700e6),
  Advisors: manualLinear("2019-10-01", "2022-09-01", 300e6),
  "Mining Rewards": manualLinear("2019-10-01", "2022-09-01", 4000e6),
  meta: {
    sources: [
      "https://www.ankr.com/docs/staking-extra/ankr-tokenomics/",
      "https://research.binance.com/en/projects/ankr-network",
      "https://cryptorank.io/ico/ankr-network",
    ],
    token: `${chain}:${ANKR}`,
    protocolIds: ["278"],
    notes: [
      `Dates are generally rounded to the nearest month since little information is available.`,
    ],
  },
  categories: {
    insiders: [
      "Private Sale 1",
      "Private Sale 2",
      "Private Sale 3",
      "Team",
      "Advisors",
    ],
    publicSale: ["Public Sale"],
    noncirculating: ["Marketing"],
    farming: ["Mining Rewards"],
  },
};
export default convex;
