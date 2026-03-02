import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { months } from "../utils/time";

const start = 0 // no official TGE date yet 
const total = 1_000_000_000;
const shares = {
    investors: total * 0.23,
    team: total * 0.195,
    ecosystem: total * 0.111,
    foundation: total * 0.12,
    marketing: total * 0.089,
    liquidity: total * 0.02,
    airdrop: total * 0.235
}

const opinion: Protocol = {
    "Investors": manualLinear(months(start, 12), months(start, 36), shares.investors),
    "Team & Advisors": manualLinear(months(start, 12), months(start, 36), shares.team),
    "Ecosystem & Incentives": [manualCliff(start, total * 0.0565), manualLinear(start, months(start, 36), total * 0.0545)],
    "Foundation": [manualCliff(start, total * 0.01), manualLinear(months(start, 6), months(start, 12), total * 0.11)],
    "Marketing": [manualCliff(start, total * 0.077), manualLinear(start, months(start, 6), total * 0.012)],
    "Liquidity": manualCliff(start, shares.liquidity),
    "Airdrop": [manualCliff(start, total * 0.035), manualLinear(start, months(start, 7), total * 0.2)],
    meta: {
        token: "coingecko:opinion",
        sources: [
            "https://static.opinion.trade/OPINION_Whitepaper_EN.pdf",
            "https://medium.com/@info_82635/introducing-opn-the-native-token-of-the-multiplayer-internet-445cf2c575a2"
        ],
        protocolIds: ["6926"],
        total,
    },
    categories: {
        insiders: ["Team & Advisors", "Marketing"],
        privateSale: ["Investors"],
        noncirculating: ["Foundation"],
        farming: ["Ecosystem & Incentives"],
        airdrop: ["Airdrop"],
        liquidity: ["Liquidity"],
    },
};
export default opinion;
