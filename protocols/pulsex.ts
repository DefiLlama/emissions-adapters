import { manualCliff } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const start = 1683937680; // 2023-05-12
const total = 142e12;

const pulsex: Protocol = {
  "Public Sacrifice": manualCliff(
    start,
    total * 0.1408450704,
  ),
  "Origin Address": manualCliff(
    start,
    total * 0.8591549296,
  ),
  meta: {
    token: `coingecko:pulsex`,
    notes: [
      `Public Sacrifice schedule has been estimated based on the information in the source material.`,
    ],
    sources: [`https://t.me/PulseChainCom`],
    protocolIds: ["2995"],
  },
  categories: {
    noncirculating: ["Origin Address"],
    publicSale: ["Public Sacrifice"],
  },
};
export default pulsex;
