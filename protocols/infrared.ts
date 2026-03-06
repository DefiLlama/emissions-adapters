import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { months } from "../utils/time";

const start = 1765929600; // 2025-12-17
const total = 1_000_000_000;

const shares = {
  alphaTGESale: total * 0.0075,
  airdrop: total * 0.02,
  buildABera: total * 0.1,
  liquidity: total * 0.0925,
  investors: total * 0.213,
  ecosystem: total * 0.235,
  team: total * 0.18,
  treasury: total * 0.152,
};

const insiderSchedule = (qty: number) => [
  manualCliff(months(start, 12), qty * 0.1),
  manualLinear(months(start, 12), months(start, 36), qty * 0.9),
];

const infrared: Protocol = {
    "Treasury": manualCliff(start, shares.treasury),
    "Alpha TGE Sale": manualCliff(start, shares.alphaTGESale),
    "Liquidity": manualCliff(start, shares.liquidity),
    "Airdrop": manualCliff(start, shares.airdrop),
    "Ecosystem": [manualCliff(start, shares.ecosystem * 0.2), manualLinear(start, months(start, 24), shares.ecosystem * 0.8)],
    "Build-a-Bera": insiderSchedule(shares.buildABera),
    "Investors": insiderSchedule(shares.investors),
    Team: insiderSchedule(shares.team),
    meta: {
        notes: [
            "Berachain Foundation / Build-a-Bera have committed to holding their allocation indefinitely.",
        ],
        token: "coingecko:infrared-finance",
        sources: [
            "https://infrared.finance/docs/tokens",
            "https://infrared.finance/blog/introducing-ir"
        ],
        protocolIds: ["5775"],
        total,
    },
    categories: {
        liquidity: ["Liquidity"],
        airdrop: ["Airdrop"],
        privateSale: ["Investors"],
        publicSale: ["Alpha TGE Sale"],
        insiders: ["Team"],
        noncirculating: ["Treasury", "Build-a-Bera"],
        farming: ["Ecosystem"],
    },
};

export default infrared;
