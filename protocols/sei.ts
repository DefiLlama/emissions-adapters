import { manualCliff, manualLinear, manualLog } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1691971200;
const total = 1e10;

const sei: Protocol = {
  "Private Sale": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(4),
    total * 0.2,
  ),
  "Binance Launchpool": manualCliff(start, total * 0.03),
  Team: manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(6),
    total * 0.2,
  ),
  Foundation: [
    manualCliff(start, total * 0.02),
    manualLinear(start, start + periodToSeconds.years(2), total * 0.07),
  ],
  "Ecosystem Reserve": [
    manualCliff(start, total * 0.13),
    manualLog(
      start,
      start + periodToSeconds.years(7),
      total * 0.4237,
      periodToSeconds.month,
      5,
      false,
      3,
    ),
  ],
  meta: {
    token: `coingecko:sei-network`,
    notes: [
      `Ecosystem Reserve schedule has been estimated based on the chart in the source material.`,
      `Remaining Ecosystem Reserve tokens will continue to vest.`,
    ],
    sources: [`https://www.binance.com/en/research/projects/sei`],
    protocolIds: ["4664"],
  },
  categories: {
    noncirculating: ["Ecosystem Reserve"],
    publicSale: ["Binance Launchpool"],
    privateSale: ["Private Sale"],
    insiders: ["Team","Foundation"],
  },
};
export default sei;
