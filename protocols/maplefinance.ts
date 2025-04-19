import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1618876800; // April 20, 2021
const totalSupply = 10_000_000;

const liquidityMining = totalSupply * 0.30;  // 3M MPL (30%)
const teamAdvisor = totalSupply * 0.25;      // 2.5M MPL (25%)
const seed = totalSupply * 0.26;             // 2.6M MPL (26%)
const publicSale = totalSupply * 0.05;       // 500K MPL (5%)
const treasury = totalSupply * 0.14;             // 1.4M MPL (14%)

const mpl: Protocol = {
  "Liquidity Mining": manualCliff(
    start,
    liquidityMining
  ),

  "Treasury": manualCliff(
    start,
    treasury
  ),

  "Public Sale": manualCliff(
    start,
    publicSale
  ),

  "Team and Advisor": manualLinear(
    start,
    start + periodToSeconds.years(2),
    teamAdvisor
  ),

  "Seed Investors": manualLinear(
    start,
    start + periodToSeconds.years(1.5),
    seed
  ),

  meta: {
    token: "ethereum:0x643c4e15d7d62ad0abec4a9bd4b001aa3ef52d66",
    sources: ["https://content.forgd.com/p/tokenomics-101-maple-finance"],
    protocolIds: ["parent#maple-finance"],
    notes: [
      "This allocation are based on the old MAPLE token, which was migrated to SYRUP token.",
    ]
  },

  categories: {
    insiders: [
      "Team and Advisor",
      "Seed Investors"
    ],
    noncirculating: [
        "Treasury"
    ],
    publicSale: [
      "Public Sale"
    ],
    farming: [
      "Liquidity Mining"
    ]
  },
};

export default mpl;
