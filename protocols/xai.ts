import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const total: number = 25e8;
const start: number = 1704758400;

const xai: Protocol = {
  Launchpool: manualCliff(start, total * 0.03),
  Community: manualCliff(start, total * 0.05),
  "Market Makers": manualCliff(start, total * 0.02),
  Foundation: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(18),
    total * 0.0162,
  ),
  DAC: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(18),
    total * 0.07,
  ),
  Team: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(42),
    total * 0.2,
  ),
  Investors: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(30),
    total * 0.2241,
  ),
  Ecosystem: manualLinear(
    start + periodToSeconds.months(6),
    start + periodToSeconds.months(42),
    total * 0.055,
  ),
  meta: {
    notes: [
      `Remaining supply rate of emission is determined by supplies of XAI and esXAI at the time which cannot be determined. Therefore these emissions have been excluded from our analysis.`,
    ],
    sources: [
      `https://xai-foundation.gitbook.io/xai-network/about-xai/xai-tokenomics/token-metrics-and-initial-allocation`,
    ],
    token: `coingecko:xai-blockchain`,
    protocolIds: ["4797"],
    total,
  },
  categories: {
    publicSale: ["Launchpool","Market Makers"],
    farming: ["Community","Ecosystem","DAC"],
    noncirculating: ["Foundation"],
    privateSale: ["Investors"],
    insiders: ["Team"],
  },
};
export default xai;
