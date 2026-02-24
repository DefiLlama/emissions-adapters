import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { months, years } from "../utils/time";

const start = 1758153600; // 2025-09-18
const total = 1_000_000_000;

const shares = {
    airdropS1: total * 0.04,
    ecosystemActivation: total * 0.11,
    communitySale: total * 0.015,
    ecosystemDev: total * 0.185,
    foundation: total * 0.20,
    investors: total * 0.20,
    contributors: total * 0.25,
};

const lombard: Protocol = {
    "Airdrop Season 1": [manualCliff(start, total * 0.015), manualCliff(months(start, 6), total * 0.015), manualCliff(months(start, 12), total * 0.01)],
    "Ecosystem Activation": manualCliff(start, shares.ecosystemActivation),
    "Community Sale": manualCliff(start, shares.communitySale),
    "Ecosystem Development": [
        manualCliff(start, total * 0.0425),
        manualLinear(start, months(start, 24), shares.ecosystemDev - total * 0.0425),
    ],
    "Liquid Bitcoin Foundation": [
        manualCliff(start, total * 0.0425),
        manualLinear(start, years(start, 3), shares.foundation - total * 0.0425),
    ],
    "Early Investors": manualLinear(years(start, 1), years(start, 4), shares.investors),
    "Core Contributors": manualLinear(years(start, 1), years(start, 4), shares.contributors),

    meta: {
        token: "coingecko:lombard",
        sources: [
            "https://docs.lombard.finance/learn/token-economics",
        ],
        protocolIds: ["parent#lombard"],
        total,
    },
    categories: {
        airdrop: ["Airdrop Season 1"],
        farming: ["Ecosystem Activation"],
        publicSale: ["Community Sale"],
        insiders: ["Core Contributors"],
        privateSale: ["Early Investors"],
        noncirculating: ["Liquid Bitcoin Foundation", "Ecosystem Development"],
    },
};
export default lombard;
