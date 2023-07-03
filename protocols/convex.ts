import { manualCliff, manualLinear } from "../adapters/manual";
import { supply, latest } from "../adapters/supply";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const deployTime = 1621292400;
const chain: any = "ethereum";
const CVX: string = "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b";
const convex: Protocol = {
  Investors: manualLinear(
    deployTime,
    deployTime + periodToSeconds.year,
    3300000,
  ),
  Treasury: manualLinear(
    deployTime,
    deployTime + periodToSeconds.year,
    9700000,
  ),
  Team: manualLinear(deployTime, deployTime + periodToSeconds.year, 10000000),
  "veCRV voters": manualCliff(deployTime, 1000000),
  "veCRV holders": manualCliff(deployTime, 1000000),
  "Liquidity mining": manualLinear(
    deployTime,
    deployTime + 4 * periodToSeconds.year,
    25000000,
  ),
  "Curve LP rewards": () => supply(chain, CVX, deployTime, "convex", 50000000),
  meta: {
    sources: [
      "https://docs.convexfinance.com/convexfinance/general-information/tokenomics",
    ],
    token: `${chain}:${CVX}`,
    protocolIds: ["319"],
    incompleteSections: [
      {
        key: "Curve LP rewards",
        allocation: 50000000,
        lastRecord: () => deployTime, // latest("convex-finance", deployTime),
      },
    ],
  },
  categories: {
    insiders: ["Investors", "Team"],
    noncirculating: ["Treasury"],
    airdrop: ["veCRV voters", "veCRV holders"],
    farming: ["Liquidity mining", "Curve LP rewards"],
  },
};
export default convex;
