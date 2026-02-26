import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds, years } from "../utils/time";

const start = 1759104000; // 2025-09-29
const total = 10_000_000_000;
const shares = {
    ecosystem: total * 0.35,
    foundation: total * 0.24,
    team: total * 0.20,
    airdrop: total * 0.083,
    marketing: total * 0.082,
    investors: total * 0.045,
};

const falconFinance: Protocol = {
    "Ecosystem": manualCliff(start, shares.ecosystem),
    "Foundation": manualCliff(start, shares.foundation),
    "Marketing": manualCliff(start, shares.marketing),
    "Community Airdrops & Launchpad Sale": manualCliff(start, shares.airdrop),
    "Core Team & Early Contributors": manualLinear(years(start, 1), years(start, 4), shares.team),
    "Investors": manualLinear(years(start, 1), years(start, 4), shares.investors),    
    meta: {
        notes: ["The Ecosystem, Marketing and Foundation allocation don't have a defined unlock schedule, we have categorized them under non-circulating"],
        token: "coingecko:falcon-finance-ff",
        sources: [
            "https://docs.falcon.finance/ff-token/ff-tokenomics",
        ],
        protocolIds: ["6790"],
        total,
    },
    categories: {
        insiders: ["Core Team & Early Contributors"],
        privateSale: ["Investors"],
        noncirculating: ["Ecosystem", "Foundation", "Marketing"],
        airdrop: ["Community Airdrops & Launchpad Sale"],
    },
};
export default falconFinance;
