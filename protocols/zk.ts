import { Protocol } from "../types/adapters";
import { manualLinear, manualCliff } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const total = 21_000_000_000; // 21 billion
const start = 1718582400;

const schedule = (allo: number) => [
  manualCliff(start + periodToSeconds.year, total * 0.11 * allo),
  manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(4),
    total * 0.89 * allo,
  ),
];

const zk: Protocol = {
  Airdrop: manualCliff(start, total * 0.175),
  "Ecosystem Initiatives": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.199,
  ),
  Investors: schedule(0.1719),
  Team: schedule(0.1614),
  // "Token Assembly": [],
  meta: {
    notes: [
      `Ecosystem Initiatives (19.90%) are minted on demand with no set unlock schedule. In this analysis we have estimated a 4 year linear unlock.`,
      `No tokens will be minted for Token Assembly (29.27%) until governance is live (TBC).`,
      `In this analysis we've assumed Team and Investors allocations unlock in equal proportions at the cliff.`,
    ],
    sources: ["https://docs.zknation.io/zk-token/zk-token"],
    token: "coingecko:zksync",
    protocolIds: ["4844"],
  },
  categories: {
    insiders: ["Team", "Investors"],
    airdrop: ["Airdrop"],
    noncirculating: ["Ecosystem Initiatives"],
  },
};

export default zk;
