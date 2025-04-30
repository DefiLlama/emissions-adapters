import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1674172800;
const total = 1e9;

const fasttoken: Protocol = {
  Marketing: manualCliff(start, total * 0.1),
  Blockchain: manualCliff(start, total * 0.12),
  Partners: manualCliff(start, total * 0.06),
  Ecosystem: manualCliff(start, total * 0.24),
  Presale: manualCliff(start + periodToSeconds.months(9), total * 0.06),
  "Private Sale": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    10,
    (total * 0.18) / 10,
  ),
  "Public Sale": manualCliff(start, total * 0.01),
  Founders: manualStep(
    start + periodToSeconds.years(2),
    periodToSeconds.month,
    10,
    (total * 0.2) / 10,
  ),
  Advisors: manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    10,
    (total * 0.03) / 10,
  ),
  meta: {
    token: "coingecko:fasttoken",
    sources: [`https://fasttoken.com/`],
    protocolIds: ["4923"],
  },
  categories: {
    publicSale: ["Public Sale","Blockchain"],
    noncirculating: ["Ecosystem"],
    privateSale: ["Private Sale","Presale"],
    insiders: ["Advisors","Founders","Marketing","Partners"],
  },
};

export default fasttoken;
