import { manualCliff } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const qty = 21000000; // Total BOOM token supply
const start = 1704067200; // Adjust to Boom Token's official launch date
const vestingPeriod = periodToSeconds.month; // 1-Month vesting

const boomTokenAI: Protocol = {
  "AI Staking & Governance Rewards": manualCliff(start + vestingPeriod, 7500000), // AI-powered staking rewards
  "AI Market Analytics": manualCliff(start + vestingPeriod, 1000000), // AI-based trading insights
  "AI Security & Risk Monitoring": manualCliff(start + vestingPeriod, 500000), // AI fraud detection
  "AI Trading Bots": manualCliff(start + vestingPeriod, 750000), // Automated trading & liquidity AI
  "DEX Liquidity (Uniswap/PancakeSwap)": manualCliff(start + vestingPeriod, 2000000), // BOOM Token liquidity
  "Community Growth & Grants": manualCliff(start + vestingPeriod, qty * 0.07), // Incentives for new builders
  "Boom Treasury & Endowment": manualCliff(start + vestingPeriod, qty * 0.10), // Long-term sustainability
  "Core Team & Advisors": manualCliff(start + vestingPeriod, qty * 0.18), // Fully unlocked after 1 month
  "Strategic Partners & Service Providers": manualCliff(start + vestingPeriod, qty * 0.05),
  "Seed & Private Investors": manualCliff(start + vestingPeriod, qty * 0.25), // Investors unlock fully in 1 month
  meta: {
    sources: ["https://boomtoken.io/ai-agents"], // Official Boom Token AI page
    token: "bsc:0xcd6a51559254030ca30c2fb2cbdf5c492e8caf9c", // BOOM Token contract (BSC)
    protocolIds: ["BOOM_AI"],
  },
  categories: {
    farming: ["AI Staking & Governance Rewards", "DEX Liquidity (Uniswap/PancakeSwap)"],
    security: ["AI Security & Risk Monitoring"],
    analytics: ["AI Market Analytics"],
    automation: ["AI Trading Bots"],
    governance: ["Boom Treasury & Endowment", "Community Growth & Grants"],
    noncirculating: ["Boom Treasury & Endowment", "Community Growth & Grants"],
    insiders: ["Core Team & Advisors", "Strategic Partners & Service Providers", "Seed & Private Investors"],
  },
};

export default boomTokenAI;
