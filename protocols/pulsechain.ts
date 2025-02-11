import { manualCliff } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const start = 1683937680; // 2023-05-12
const total = 135e12;

const pulsechain: Protocol = {
  "Public Sacrifice": manualCliff(
    start,
    total * 0.1185185185,
  ),
  "Origin Address": manualCliff(
    start,
    total * 0.8814814815,
  ),
  meta: {
    token: `coingecko:pulsechain`,
    notes: [
      `Public Sacrifice schedule has been estimated based on the information in the source material.`,
    ],
    sources: [`https://t.me/PulseChainCom`],
    protocolIds: ["5374"],
  },
  categories: {
    noncirculating: ["Origin Address"],
    publicSale: ["Public Sacrifice"],
  },
};
export default pulsechain;
