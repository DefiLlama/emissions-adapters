import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1691021280; //03-08-23
const qty = 10000000;
const months_clif6 = 1706572800
const qty_ECO = 2560000


const hmx: Protocol = {
  "TGE": manualCliff(start, qty * 0.08),
  "Community Incentives": [
    manualLinear("2023-08-10", "2023-10-10", 0.048 * qty), //3 x 
    manualLinear("2023-10-10", "2024-01-10", 0.039 * qty), 
    manualLinear("2024-02-10", "2023-04-10", 0.033 * qty), 
    manualLinear("2024-05-10", "2025-07-10", 0.12 * qty), //15 x 80k
    manualLinear("2025-08-10", "2027-07-10", 0.160 * qty), // 0.0006666700 x 24
  ],
  "Team": manualLinear(
    months_clif6,
    months_clif6 + 42 * periodToSeconds.month,
    0.15 * qty,
  ),
  "Private Sale": manualLinear(
    months_clif6,
    months_clif6 + 18 * periodToSeconds.month,
    0.064 * qty,
  ),
  "HLP Surge": manualLinear(
    start,
    start + 12 * periodToSeconds.month,
    0.05 * qty,
  ),
  "Ecosystem Fund": [
    manualCliff(start, qty_ECO * 0.21875), 
    manualLinear(start , start + 4 * periodToSeconds.year, 0.78125 * qty_ECO),
  ],
  meta: {
    notes: [
      `Unlocked ecosystem fund DOES NOT immediately become part of the circulating supply. They only become available for use when unlocked, but will only be utilized if required.`,
      `HLP SURGE: This portion is reserved for participants of the HLP SURGE event that bootstraps our trading liquidity.`,
      'HMX is built with a multi-chain future in mind. Thats why the $HMX token is built utilizing the Layer Zeros Omnichain Fungible Token (OFT) standard.'
    ],
    token: "arbitrum:0x83d6c8c06ac276465e4c92e7ac8c23740f435140",
    sources: ["https://docs.hmx.org/hmx/tokenomics/hmx-token#hmx-token-allocation"],
    protocolIds: ["2296"],
  },
  categories: {
    publicSale: ["TGE"],
    farming: ["Community Incentives"],
    noncirculating: ["Ecosystem Fund"],
    privateSale: ["Private Sale"],
    insiders: ["Team"],
  },
};
export default hmx;