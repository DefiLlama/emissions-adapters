import { manualCliff, manualStep, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1608163200;
const startClifCoreTeam = 1639699200;
const endClifCoreTeam = 1734307200;
const total = 10e6;

const aave: Protocol = {
  Seed: [manualLinear(start, start + periodToSeconds.months(12), total * 0.05)],
  "Private Sale": [
    manualLinear(start, start + periodToSeconds.months(12), total * 0.13),
  ],
  "Core Team": [
    manualCliff(start + periodToSeconds.years(1), total * 0),
    manualLinear(startClifCoreTeam, endClifCoreTeam, total * 0.07),
  ],
  Advisors: [
    manualLinear(start, start + periodToSeconds.months(12), total * 0.03),
  ],
  Ecosystem: [
    manualLinear(start, start + periodToSeconds.months(119), total * 0.679),
  ],
  IDO: [manualStep(start, periodToSeconds.days(1), 1, total * 0.021)],
  "Uniswap Liquidity": [
    manualStep(start, periodToSeconds.days(1), 1, total * 0.013),
  ],
  "Market Maker": [
    manualStep(start, periodToSeconds.days(1), 1, total * 0.007),
  ],
  meta: {
    sources: [
      "https://docs.maha.xyz/governance/incentive-distribution-schedule-for-maha",
    ],
    token: "ethereum:0x745407c86DF8DB893011912d3aB28e68B62E49B0",
    protocolIds: ["4939"],
  },
  categories: {
    publicSale: ["IDO"],
    liquidity: ["Uniswap Liquidity","Market Maker"],
    noncirculating: ["Ecosystem"],
    privateSale: ["Seed","Private Sale"],
    insiders: ["Core Team","Advisors"],
  },
};
export default aave;
