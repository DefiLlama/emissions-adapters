import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { months, years } from "../utils/time";

const start = 1739318400; // 2025-02-12
const total = 1e9;

const myshell: Protocol = {
  "Private Sale": manualLinear(
    years(start, 1),
    years(start, 4),
    total * 0.29,
  ),
  Advisors: manualLinear(
    years(start, 1),
    years(start, 4),
    total * 0.03,
  ),
  Team: manualLinear(
    years(start, 1),
    years(start, 5),
    total * 0.12,
  ),
  IDO: manualCliff(start, total * 0.04),
  Marketing: manualCliff(start, total * 0.025),
  "Binance Wallet Airdrop": manualCliff(start, total * 0.01),
  "Ecosystem and Treasury": [
    manualCliff(start, total * 0.025),
    manualLinear(start, years(start, 5), total * 0.06),
  ],
  "Binance HODLer": [
    manualCliff(start, total * 0.025),
    manualCliff(months(start, 6), total * 0.025),
  ],
  "Community Incentive": [
    manualCliff(start, total * 0.07),
    manualLinear(start, years(start, 5), total * 0.23),
  ],
  Liquidity: manualCliff(start, total * 0.05),

  meta: {
    token: "ethereum:0xf2c88757f8d03634671208935974b60a2a28bdb3",
    sources: ["https://docs.myshell.ai/tokenomics/shell-basics"],
    protocolIds: ["7612"],
    total,
    notes: [
        "After their TGE unlocks the Ecosystem & Treasury and Community Incentives allocations vest linearly over 5 years"
    ]
  },
  categories: {
    insiders: ["Advisors", "Team", "Marketing"],
    privateSale: ["Private Sale"],
    publicSale: ["IDO", "Binance HODLer"],
    farming: ["Community Incentive"],
    airdrop: ["Binance Wallet Airdrop"],
    noncirculating: ["Ecosystem and Treasury"],
    liquidity: ["Liquidity"],
  },
};

export default myshell;
