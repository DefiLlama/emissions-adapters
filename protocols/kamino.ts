import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const total = 1e10;
const start = 1714435200; // 30 Apr
const token = "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS";
const chain = "solana";

const kamino: Protocol = {
  "Community & Grants": manualCliff(start, total * 0.065),
  "Genesis Community Allocation": manualCliff(start, total * 0.075),
  "Season 2 Airdrop": manualCliff(
    1711411200 + periodToSeconds.days(90),
    total * 0.035,
  ),
  "Liquidity & Treasury": manualLinear(
    start,
    start + periodToSeconds.days(11 * 128),
    total * 0.275,
  ), // 250m over 128 days, 27.5% = 11 * 128 days
  "Core Contributors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.2,
  ),
  "Key Stakeholders & Advisors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.35,
  ),
  meta: {
    notes: [
      `Between 30 Apr and 4 Sep '24, 250m KMNO were spent from the Liquidity & Treasury allocation. In this analysis we have extrapolated this rate of spending.`,
    ],
    sources: ["https://docs.kamino.finance/kmno/token-info"],
    token: `${chain}:${token}`,
    protocolIds: ["2062", "3770"],
  },
  categories: {
    publicSale: ["Liquidity & Treasury"],
    insiders: ["Core Contributors", "Key Stakeholders & Advisors"],
    airdrop: ["Genesis Community Allocation", "Season 2 Airdrop"],
    noncirculating: ["Community & Grants"],
  },
};
export default kamino;
