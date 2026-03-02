import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { months } from "../utils/time";

const start = 1766448000; // 2025-12-23
const total = 100_000_000;
const shares = {
  incentives: total * 0.21,
  investors: total * 0.26,
  buildABera: total * 0.10,
  coreContributors: total * 0.17,
  advisors: total * 0.03,
  liquidity: total * 0.05,
  foundation: total * 0.15,
  publicSale: total * 0.03,
};

const kodiak: Protocol = {
    "Liquidity": manualCliff(start, shares.liquidity),
    "Public Sale": manualCliff(start, shares.publicSale),
    "Incentives": [
        manualCliff(start, shares.incentives * 0.25),
        manualLinear(start, months(start, 36), shares.incentives * 0.75),
    ],
    "Investors": manualLinear(start, months(start, 24), shares.investors),
    "Build-a-Bera": manualLinear(start, months(start, 24), shares.buildABera),
    "Core Contributors": manualLinear(
        months(start, 6),
        months(start, 30),
        shares.coreContributors,
    ),
    "Advisors": manualLinear(
        months(start, 6),
        months(start, 30),
        shares.advisors,
    ),
    "Foundation & Ecosystem Growth": [
        manualCliff(start, shares.foundation * 0.10),
        manualLinear(start, months(start, 24), shares.foundation * 0.90),
    ],
    meta: {
        notes: [
            "Investors and Build-a-Bera allocations vest in xKDK.",
            "Berachain Build-a-Bera has committed to holding their allocation indefinitely"
        ],
        token: "coingecko:kodiak-finance",
        sources: ["https://documentation.kodiak.finance/tokens/distribution"],
        protocolIds: ["parent#kodiak"],
        total,
    },
    categories: {
        liquidity: ["Liquidity"],
        publicSale: ["Public Sale"],
        farming: ["Incentives"],
        insiders: ["Core Contributors", "Advisors"],
        privateSale: ["Investors"],
        noncirculating: ["Foundation & Ecosystem Growth", "Build-a-Bera"],
    },
};
export default kodiak;
