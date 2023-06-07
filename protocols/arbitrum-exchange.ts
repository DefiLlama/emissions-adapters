import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1678975200;
const qty = 20000000;

const arbidex: Protocol = {
  "Initial Mint": manualCliff(start, qty * 0.029),
  Treasury: manualLinear(start, start + periodToSeconds.year * 2, qty * 0.05),
  "Liquidity Incentives": manualLinear(
    start,
    start + periodToSeconds.month * 36,
    qty * 0.871,
  ),
  Team: manualLinear(start, start + periodToSeconds.year * 2, qty * 0.05),
  meta: {
    notes: [
      "Initial Mint was composed by : Seed Investors (36.5%), Pre Sale (56.04%), Treasury (30%), Team (30%)",
    ],
    token: "arbitrum:0xD5954c3084a1cCd70B4dA011E67760B8e78aeE84",
    sources: [
      "https://arbitrum-exchange.gitbook.io/arbitrumdex/usdarx-tokenomics/usdarx-token",
    ],
    protocolIds: ["2685"],
  },
  categories: {
    publicSale: ["Initial Mint"],
    farming: ["Liquidity Incentives"],
    insiders: ["Team"],
    noncirculating: ["Treasury"],
  },
};

export default arbidex;
