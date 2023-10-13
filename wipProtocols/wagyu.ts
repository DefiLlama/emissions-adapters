import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1696118400; //01-10-2023
const qty = 1000000000; //1b
const time1y = 1727740800 //01-10-24


const wagyu: Protocol = {
  "TenderSwap Bonding": manualCliff(start, qty * 0.05),
  "Public Sale": manualCliff(start, qty * 0.05),
  "Tenderize Labs": manualLinear(
    start, start + 3 *periodToSeconds.year,
    0.1 * qty
  ),
  "Genesis Grants": manualLinear (
    start, start + 12 * periodToSeconds.month,
    0.03 * qty
  ),
  "Public Airdrop": manualLinear(
    start,
    start + 12 * periodToSeconds.month,
    0.04 * qty,
  ),
  "Staking Incentives": manualLinear(
    start, start + 3 *periodToSeconds.year,
    0.11 * qty
  ),
  "Community Incentives": manualLinear(
    start, start + 3 *periodToSeconds.year,
    0.12 * qty
  ),
  "DAO Treasury": manualLinear(
    start, start + 3 *periodToSeconds.year,
    0.125 * qty
  ),
  "Current & Future Team": manualLinear(
    time1y, time1y + 2 *periodToSeconds.year,
    0.175 * qty
  ),
  "Early Backers": manualLinear(
    time1y, time1y + 2 *periodToSeconds.year,
    0.2 * qty
  ),
  meta: {
    notes: [
      ` Regarding Incentives, after the 3 months, it will be 30%-40%-30% Supply-Borrow-Bribe. The rates can be adjusted via governance in order to keep up with the market. `,
    ],
    token: "base:0x2dc1cda9186a4993bd36de60d08787c0c382bead", //add 
    sources: ["https://www.tenderize.me/blog/wagyu-tokenomics-tge-timeline"],
    protocolIds: ["1784"],
  },
  categories: {
    insiders: ["Early Backers", "Current & Future Team", "Genesis Grants", "Tenderize Labs"],
    publicSale: ["Public Sale", "TenderSwap Bonding"],
    farming: ["Community Incentives", "Staking Incentives"],
    noncirculating: ["DAO Treasury"],
    airdrop: ["Public Airdrop"]
    
  },
};
export default wagyu;