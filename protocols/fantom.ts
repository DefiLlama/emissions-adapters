import { Protocol } from "../types/adapters";
import { manualCliff } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { LinearAdapterResult } from "../types/adapters";
const qty = 3550e6;
const start = 1529103600;

const inflation = (percentage: number): LinearAdapterResult[] => {
  const sections: LinearAdapterResult[] = [];
  let thisStart: number = start;
  let total = qty;
  const period: number = periodToSeconds.year;
  for (let i = 0; i < 10; i++) {
    const amount = total * (1 + 0.05 * percentage) - total;

    sections.push({
      type: "linear",
      start: thisStart,
      end: thisStart + period,
      amount,
    });

    total += amount;
    thisStart += period;
  }
  return sections;
};

const fantom: Protocol = {
  "Token Sale": manualCliff(start, qty * 0.4),
  "Market Development": manualCliff(start, qty * 0.3),
  "Advisors & Consultants": manualCliff(start, qty * 0.15),
  "Team & Founders": manualCliff(start, qty * 0.15),
  "Platform Incentives": inflation(0.8),
  "Node Rewards": inflation(0.2),
  meta: {
    sources: ["https://icodrops.com/fantom/"],
    token: "coingecko:fantom",
    protocolIds: ["196"],
  },
  categories: {
    publicSale: ["Token Sale"],
    insiders: ["Team & Founders", "Advisors & Consultants"],
    farming: ["Platform Incentives"],
    staking: ["Node Rewards"],
    noncirculating: ["Market Development"],
  },
};
export default fantom;
