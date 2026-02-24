import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1730073600; // 2024-10-28
const total = 1_000_000_000;
const shares = {
    airdrop: total * 0.1,
    futureIncentives: total * 0.17,
    routerRewards: total * 0.03,
    foundation: total * 0.228,
    investors: total * 0.252,
    contributors: total * 0.22,
};
const year = (n: number) => Math.round((start + periodToSeconds.years(n)) / 86400) * 86400;

const grass: Protocol = {
    "Airdrop One": manualCliff(start, shares.airdrop),
    "Future Incentives": manualLinear(start, year(4), shares.futureIncentives),
    "Router Rewards": manualLinear(start, year(4), shares.routerRewards),
    "Foundation & Ecosystem Growth": manualLinear(start, year(4), shares.foundation),
    "Early Investors": [manualCliff(start + periodToSeconds.year, shares.investors / 2), manualLinear(year(1), year(2), shares.investors / 2)],
    "Contributors": [manualCliff(start + periodToSeconds.year, shares.contributors / 4), manualLinear(year(1), year(4), (shares.contributors / 4) * 3)],
    meta: {
        notes: ["The Foundation & Ecosystem Growth, Future Incentives and Router Rewards allocations don't have a specific unlock schedule, so we used a linear schedule"],
        token: "coingecko:grass",
        sources: ["https://grass-foundation.gitbook.io/grass-docs/introduction/grass/grass-tokenomics"],
        protocolIds: ["7445"],
        total,
    },
    categories: {
        insiders: ["Contributors"],
        privateSale: ["Early Investors"],
        staking: ["Router Rewards"],
        noncirculating: ["Foundation & Ecosystem Growth"],
        farming: ["Future Incentives"],
        airdrop: ["Airdrop One"],
    },
};
export default grass;
