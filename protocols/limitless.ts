import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { queryDailyOutflows } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = 1761091200; // 2025-10-22
const total = 1_000_000_000
const shares = {
    investors: total * 0.25,
    kaito: total * 0.0137,
    echo: total * 0.0126,
    team: total * 0.25,
    treasury: total * 0.13,
    liquidity: total * 0.1
}
async function getEcosystemOutflows() {
    const data = await queryDailyOutflows({
        token: "0x9eadbe35f3ee3bf3e28180070c429298a1b02f93",
        fromAddress: "0xbdfab8ec975166d86c7b4a882ccae95437cdb00e",
        startDate: "2025-10-21"
    })
    return data.map(d => ({
        type: "cliff" as const,
        start: readableToSeconds(d.date),
        amount: Number(d.amount),
    }))
}

const limitless: Protocol = {
    "Kaito Pre-Sale": [manualCliff(start, shares.kaito / 2), manualCliff(start + periodToSeconds.months(6), shares.kaito / 2)],
    "Investors": manualLinear(start + periodToSeconds.months(6), start + periodToSeconds.months(30), shares.investors),
    "Echo Round": manualLinear(start + periodToSeconds.months(6), start + periodToSeconds.months(30), shares.echo),
    "Treasury": manualLinear(start + periodToSeconds.months(6), start + periodToSeconds.months(30), shares.treasury),
    "Team": [manualCliff(start + periodToSeconds.months(12), shares.team * 0.33), manualLinear(start + periodToSeconds.months(12), start + periodToSeconds.months(36), shares.team * 0.67)],
    "Liquidity": manualCliff(start, shares.liquidity),
    "Ecosystem Rewards": getEcosystemOutflows,
    meta: {
        notes: [
        "The current circulating supply of the Ecosystem Rewards allocation is determined by the outflows from this address: 0xbdfab8ec975166d86c7b4a882ccae95437cdb00e"
        ],
        token: "coingecko:limitless-3",
        sources: [
            "https://x.com/trylimitless/status/1980662566482305087",
            "https://basescan.org/address/0xbdfab8ec975166d86c7b4a882ccae95437cdb00e#tokentxns"
        ],
        protocolIds: ["5181"],
        total,
    },
    categories: {
        insiders: ["Team"],
        privateSale: ["Investors"],
        publicSale: ["Echo Round", "Kaito Pre-Sale"],
        noncirculating: ["Treasury"],
        liquidity: ["Liquidity"],
        farming: ["Ecosystem Rewards"]
    },
};
export default limitless;
