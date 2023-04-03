import { manualCliff, manualLinear, manualLog } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1649246400;
const qty = 10_000_000;
const end = 1838635200



const conic: Protocol = {
    vlCVX_Holders: manualCliff(start, qty * 0.1),
    Community_raise: manualCliff(start, qty * 0.3),
    Staking_Omnipool_LP: manualLog(start, end, 2_500_000 ,periodToSeconds.year * 6 , 60),
   //Rebalancing_Curve_Pools: manualCliff,
    Treasury: manualLinear(start, start + periodToSeconds.month * 12, qty * 0.05),
    AMM_Stakers: manualLog(start, end, 1_000_000 ,periodToSeconds.year * 6, 60),
    Liquidity: manualCliff(start, qty * 0.01),
  notes: [
    `No mention regarding if the team founders have tokens or not.`,
    'Rebalancing Curve pools (19%) CNC received will be based on the amount deposited. We cant track this',
  ],
  token: "ethereum:0x9ae380f0272e2162340a5bb646c354271c0f5cfc",
  sources: ["https://docs.conic.finance/conic-finance/usdcnc-token/usdcnc-tokenomics"],
  protocolIds: ["2626"],
};

export default conic;