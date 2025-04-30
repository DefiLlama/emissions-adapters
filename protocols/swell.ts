import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1730937600; // Nov 7 '24
const total = 1e10;

const swell: Protocol = {
  "Launch Pools": manualCliff(start, total * 0.013553),
  Community: [
    manualCliff(start, total * 0.085),
    manualLinear(start, start + periodToSeconds.year, total * 0.07),
  ],
  Team: manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(4),
    total * 0.25,
  ),
  Fundraising: manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.months(42),
    total * 0.25,
  ),
  Foundation: manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.25,
  ),
  meta: {
    notes: [
      `No unlocks schedule is given for the Foundation allocation. In this analysis we have estimated a 4 year linear unlock.`,
    ],
    token: `coingecko:swell-network`,
    sources: ["https://docs.swellnetwork.io/swell-dao/governance/tokenomics"],
    protocolIds: ["2901", "4078", "4461", "4991", "5262"],
  },
  categories: {
    publicSale: ["Launch Pools"],
    airdrop: ["Community"],
    noncirculating: ["Foundation"],
    privateSale: ["Fundraising"],
    insiders: ["Team"],
  },
};

export default swell;
