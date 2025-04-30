import { Protocol } from "../types/adapters";
import { manualLinear, manualStep, manualCliff } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 7_200_000_000;
const start = 1629331200; // 19 August 2021

const benqi: Protocol = {
  "Community Incentives": manualLinear(start, start + periodToSeconds.year * 5, totalSupply * 0.45),
    "Seed": [
        manualCliff(start, totalSupply * 0.05 * 0.10),
        manualLinear(start, start + periodToSeconds.month * 24, totalSupply * 0.05 * 0.90)
    ],
    "Private": [
        manualCliff(start, totalSupply * 0.13 * 0.15),
        manualLinear(start, start + periodToSeconds.month * 12, totalSupply * 0.13 * 0.85)
    ],
    "Public A": [
        manualCliff(start, totalSupply * 0.053 * 0.20),
        manualLinear(start, start + periodToSeconds.month * 12, totalSupply * 0.053 * 0.80)
    ],
    "Public B": manualCliff(start, totalSupply * 0.017),
    "Team": [
        manualCliff(start + periodToSeconds.year, totalSupply * 0.10 * (1/12)), 
        manualStep(start + periodToSeconds.year, periodToSeconds.month * 3, 11, totalSupply * 0.10 * (1/12))
    ],
    "Foundation Treasury": [
        manualCliff(start + periodToSeconds.month * 9, totalSupply * 0.15 * (1/12)),
        manualStep(start + periodToSeconds.month * 9, periodToSeconds.month * 3, 11, totalSupply * 0.15 * (1/12))
  ],
    "Exchange Liquidity": manualCliff(start, totalSupply * 0.05),
    

    meta: {
        sources: ["https://docs.benqi.fi/benqinomics/token-distribution"],
        token: "avax:0x8729438eb15e2c8b576fcc6aecda6a148776c0f5",
        protocolIds: ["467"],
    },
    categories: {
    farming: ["Community Incentives"],
    noncirculating: ["Foundation Treasury"],
    publicSale: ["Public A","Public B"],
    liquidity: ["Exchange Liquidity"],
    privateSale: ["Seed","Private"],
    insiders: ["Team"],
  },
};

export default benqi;
