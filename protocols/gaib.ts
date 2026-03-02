import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { months, periodToSeconds, years } from "../utils/time";

const start = 1763424000; // 2025-11-18
const total = 1_000_000_000;
const shares = {
    earlySupporters: total * 0.1982,
    contributors: total * 0.2070,
    community: total * 0.4,
    ecosystem: total * 0.09,
    liquidity: total * 0.1048
}

const gaib: Protocol = {
    "Early Supporters & Backers": manualLinear(years(start, 1), years(start, 3), shares.earlySupporters),
    "Liquidity": manualCliff(start, shares.liquidity),
    "Core Contributors": manualLinear(years(start, 1), years(start, 4), shares.contributors),
    "Community": [manualCliff(start, shares.community / 4), manualLinear(start + periodToSeconds.day, months(start + periodToSeconds.day, 60), (shares.community / 4) * 3)],
    "Growth & Ecosystem": manualLinear(start + periodToSeconds.day, months(start + periodToSeconds.day, 60), shares.ecosystem),
    meta: {
        notes: [
            "The community allocation is dedicated to rewarding users, validators, and builders who actively contribute to the GAIB ecosystem.",
            "The Growth & Ecosystem allocation is split into an immediate TGE unlock (Liquidity) and a vested portion (Growth & Ecosystem).",
        ],
        token: "coingecko:gaib",
        sources: [
            "https://docs.gaib.ai/gaib-overview/usdgaib-token", 
            "https://gaibfoundation.org/tokenomics"],
        protocolIds: ["6535"],
        total,
    },
    categories: {
        insiders: ["Early Supporters & Backers", "Core Contributors"],
        noncirculating: ["Growth & Ecosystem"],
        liquidity: ["Liquidity"],
        farming: ["Community"],
    },
};
export default gaib;
