import { manualCliff, manualLinear } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start: number = 1587510000;
const qty: number = 1e9;

function newIssuance(): LinearAdapterResult[] {
  const sections: LinearAdapterResult[] = [];
  let thisStart: number = start;
  let workingQty: number = qty;
  for (let i = 0; i < 5; i++) {
    const amount: number = workingQty * 0.05;
    const end: number = thisStart + periodToSeconds.year;
    sections.push({
      type: "linear",
      start: thisStart,
      end,
      amount,
    });
    thisStart = end;
    workingQty += amount;
  }
  return sections;
}

const near: Protocol = {
  "Core Team": [
    manualCliff(start + periodToSeconds.year, qty * 0.14 * 0.25),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.year * 4,
      qty * 0.14 * 0.75,
    ),
  ],
  "Prior Backers 12m": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    6259859,
  ),
  "Prior Backers 24m": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    154642000,
  ),
  "Prior Backers 36m": manualLinear(
    start,
    start + periodToSeconds.year * 2,
    75733949,
  ),
  "Community Sale": [
    manualCliff(start, 25e6),
    manualLinear(start, start + periodToSeconds.month * 18, qty * 0.12 - 25e6),
  ],
  "Early Ecosystem": manualLinear(
    start,
    start + periodToSeconds.month * 6,
    3e7,
  ),
  "Foundation Endowment": [
    manualCliff(start, qty * 0.05),
    manualLinear(start, start + periodToSeconds.year * 2, qty * 0.05),
  ],
  "Operations Grants": manualLinear(
    start,
    start + periodToSeconds.year * 5,
    qty * 0.114,
  ),
  "New Issuance": newIssuance(),
  meta: {
    notes: [
      `Community Sale tokens have a 12 to 24 month lockup. Here we have taken an average of 18 months lock up.`,
      `87M of Early Ecosystem tokens (8.7% of total) have no set unlock schedule yet.`,
    ],
    sources: [`https://near.org/blog/near-token-supply-and-distribution`],
    token: `coingecko:near`,
    protocolIds: ["3221"],
  },
  categories: {
    insiders: ["Core Team"],
    privateSale: ["Prior Backers 12m", "Prior Backers 24m", "Prior Backers 36m"],
    publicSale: ["Community Sale"],
    staking: ["New Issuance"],
    noncirculating: ["Foundation Endowment", "Operations Grants", "Early Ecosystem"],
  },
};
export default near;
