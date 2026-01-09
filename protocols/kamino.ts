import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const total = 1e10;
const start = 1714435200;
const token = "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS";
const chain = "solana";

const kamino: Protocol = {
  "Community & Grants": manualCliff(start, total * 0.185),
  "Liquidity & Treasury": manualCliff(start, total * 0.10),
  "Genesis Allocation": manualCliff(start, total * 0.075),
  "Season 2 Allocation": manualCliff(1724630400, total * 0.035),
  "Season 3 Allocation": manualCliff(1748822400, total * 0.035),
  "Season 4 Allocation": manualCliff(1763337600, total * 0.01),
  "Season 5 Allocation": manualCliff(1770595200, total * 0.01),
  "Core Contributors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.20,
  ),
  "Key Stakeholders & Advisors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.35,
  ),
  meta: {
    sources: ["https://docs.kamino.finance/kmno/token-info"],
    token: `${chain}:${token}`,
    protocolIds: ["2062", "3770"],
  },
  categories: {
    noncirculating: ["Community & Grants"],
    liquidity: ["Liquidity & Treasury"],
    airdrop: ["Genesis Allocation", "Season 2 Allocation", "Season 3 Allocation", "Season 4 Allocation", "Season 5 Allocation"],
    insiders: ["Core Contributors", "Key Stakeholders & Advisors"],
  },
};

export default kamino;
