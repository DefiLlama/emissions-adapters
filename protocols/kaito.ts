import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const totalSupply = 1000000000;
const start = 1740009600;

const kaito: Protocol = {
  "Initial Community & Ecosystem": manualCliff(start, totalSupply * 0.1),
  "Liquidity Incentives": manualCliff(start, totalSupply * 0.05),
  "Binance Holder": manualCliff(start, totalSupply * 0.02),
  "Ecosystem & Network Growth": [
    manualCliff(start, totalSupply * 0.0214), // 2.14% at TGE
    manualStep(
      start + periodToSeconds.months(5), //based on chart pic from docs it starts at August, 6 months from TGE
      periodToSeconds.month,
      42,
      (totalSupply * (0.322 - 0.0214)) / 42,
    ),
  ],
  "Core Contributors": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    36,
    (totalSupply * 0.25) / 36,
  ),
  Foundation: [
    manualCliff(start, totalSupply * 0.05), // 5% at TGE
    manualStep(
      start + periodToSeconds.months(5), //based on chart pic from docs it starts at August, 6 months from TGE
      periodToSeconds.month,
      42,
      (totalSupply * (0.10 - 0.05)) / 42,
    ),
  ],
  "Early Backers": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    36,
    (totalSupply * 0.083) / 36,
  ),
  "Long-term Creator Incentives": manualStep(
    start,
    periodToSeconds.month * 6,
    4,
    (totalSupply * 0.075) / 4,
  ),
  meta: {
    sources: [
      "https://docs.kaito.ai/introducing-usdkaito/tokenomics",
      "https://www.binance.com/en/research/projects/kaito"
    ],
    token: "base:0x98d0baa52b2d063e780de12f615f963fe8537553",
    protocolIds: ["6028"]
  },
  categories: {
    noncirculating: ["Foundation","Ecosystem & Network Growth"],
    farming: ["Liquidity Incentives","Long-term Creator Incentives"],
    airdrop: ["Initial Community & Ecosystem","Binance Holder"],
    privateSale: ["Early Backers"],
    insiders: ["Core Contributors"],
  }
};

export default kaito;
