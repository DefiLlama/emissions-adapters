import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const TGE = 1730984400; // 2024-11-07 13:00 UTC
const TOTAL_SUPPLY = 1e9; // 1,000,000,000
const CBL_ADDRESS = "0xD6b3d81868770083307840F513A3491960b95cb6";
const CHAIN = "arbitrum";

const cbl: Protocol = {
  // 26% of Total Allocation
  // 6 month cliff, followed by a 24-month daily linear vesting
  "Private Sale": manualStep(TGE + periodToSeconds.month * 7, periodToSeconds.month, 24, (TOTAL_SUPPLY * 0.26) / 24),
  // 3.0% of Total Allocation
  // 30% on TGE, followed by a 6-month daily linear vesting
  "Public Sale": [
    manualCliff(TGE, TOTAL_SUPPLY * 0.03 * 0.3),
    manualStep(TGE + periodToSeconds.month, periodToSeconds.month, 6, (TOTAL_SUPPLY * 0.03 * 0.7) / 6),
  ],
  // 30% of Total Allocation
  // 15% on TGE, followed by a 60-month daily linear vesting
  "Community Growth & Rewards": [
    manualCliff(TGE, TOTAL_SUPPLY * 0.3 * 0.15),
    manualStep(TGE + periodToSeconds.month, periodToSeconds.month, 60, (TOTAL_SUPPLY * 0.3 * 0.85) / 60),
  ],
  // 20% of Total Allocation
  // 10% on TGE, followed by a 60-month daily linear vesting
  Treasury: [
    manualCliff(TGE, TOTAL_SUPPLY * 0.2 * 0.1),
    manualStep(TGE + periodToSeconds.month, periodToSeconds.month, 60, (TOTAL_SUPPLY * 0.2 * 0.9) / 60),
  ],
  // 3.0% of Total Allocation
  // 100% on TGE
  Liquidity: manualCliff(TGE, TOTAL_SUPPLY * 0.03),
  // 3.0% of Total Allocation
  // 12 month cliff, followed by a 36-month daily linear vesting
  "Partners & Advisors": manualStep(TGE + periodToSeconds.year, periodToSeconds.month, 36, (TOTAL_SUPPLY * 0.03) / 36),
  // 15% of Total Allocation
  // 12 month cliff, followed by a 36-month daily linear vesting
  "Core & Future Team": manualStep(TGE + periodToSeconds.year, periodToSeconds.month, 36, (TOTAL_SUPPLY * 0.15) / 36),
  meta: {
    sources: ["https://docs.credbull.io/docs/litepaper"],
    token: `${CHAIN}:${CBL_ADDRESS}`,
    protocolIds: [],
  },
  categories: {
    insiders: ["Partners & Advisors", "Core & Future Team"],
    liquidity: ["Liquidity"],
    publicSale: ["Public Sale"],
    noncirculating: ["Treasury"],
  },
};
export default cbl;
