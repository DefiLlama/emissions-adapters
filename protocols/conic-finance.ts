import { manualCliff, manualLinear, manualLog } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";
import { rebalancing, latest } from "../adapters/conic-finance";

const start = 1649246400;
const qty = 10000000;
const end = 1838635200;

const conic: Protocol = {
  "vlCVX holders": manualCliff(start, qty * 0.1),
  "Community raise": manualCliff(start, qty * 0.3),
  "Staking Omnipool LP": manualLog(
    start,
    end,
    2500000,
    periodToSeconds.year,
    60,
  ),
  "Rebalancing Curve Pools": () => rebalancing(),
  Treasury: manualLinear(start, start + periodToSeconds.month * 12, qty * 0.05),
  "AMM stakers": manualLog(start, end, 1000000, periodToSeconds.year, 60),
  Liquidity: manualCliff(start, qty * 0.01),
  meta: {
    notes: [`No mention regarding if the team founders have tokens or not.`],
    token: "ethereum:0x9ae380f0272e2162340a5bb646c354271c0f5cfc",
    sources: [
      "https://docs.conic.finance/conic-finance/usdcnc-token/usdcnc-tokenomics",
    ],
    protocolIds: ["2616"],
    incompleteSections: [
      {
        key: "Rebalancing Curve Pools",
        allocation: qty * 0.19,
        lastRecord: () => latest(),
      },
    ],
  },
  categories: {
    airdrop: ["vlCVX holders"],
    publicSale: ["Community raise"],
    farming: [
      "Staking Omnipool LP",
      "AMM stakers",
      "Liquidity",
      "Rebalancing Curve Pools",
    ],
    noncirculating: ["Treasury"],
  },
  total: qty
};

export default conic;
