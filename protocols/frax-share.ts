import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1608422400;
const totalQty = 100_000_000;

const fxs: Protocol = {
  "Liquidity Programs / Farming / Community": manualCliff(start, totalQty * 0.12),
  "Treasury / Grants / Partnerships / Bug Bounties": manualCliff(1608426000, totalQty * 0.05),
  "Team / Founders / Early Project Members": [
    manualCliff(1608422400, totalQty * 0.1),
    manualLinear(1608422400,1639958400, totalQty * 0.1),
  ],
  "Strategic Advisors / Outside Early Contributors": manualLinear(1611104400, 1703030400, totalQty * 0.03),
  "Accredited Private Investors": [
    manualCliff(1608422400, (totalQty * 12) * 0.02),
    manualLinear(start, start + 1624147200, (totalQty * 0.12)*0.05),
    manualLinear(start, start + 1639958400, (totalQty * 0.12)*0.05)],
  

  sources: [
    "https://docs.frax.finance/token-distribution/frax-share-fxs-distribution",
  ],
  token: "ethereum:0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0",
  protocolIds: [""],
};

export default fxs;