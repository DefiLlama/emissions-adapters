import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1649246400;
const qty = 10_000_000;



const conic: Protocol = {
    vlCVX_Holders: manualCliff(start, qty * 0.1),
    Community_raise: manualCliff(start, qty * 0.3),
    Liquidity_Providers: manualLinear(start, start + periodToSeconds.month * 60, qty * 0.44),
    Treasury: manualLinear(start, start + periodToSeconds.month * 12, qty * 0.05),
    AMM_Stakers: manualLinear(start, start + periodToSeconds.week * 60, qty * 0.1),
    Liquidity: manualCliff(start, qty * 0.01),
  notes: [
    `No mention regarding if the team founders have tokens or not.`,
  ],
  token: "ethereum:0x9ae380f0272e2162340a5bb646c354271c0f5cfc",
  sources: ["https://docs.conic.finance/conic-finance/usdcnc-token/usdcnc-tokenomics"],
  protocolIds: ["2626"],
};

export default conic;