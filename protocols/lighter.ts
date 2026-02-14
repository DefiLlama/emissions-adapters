import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1766966400; // 2025-12-29
const total = 1_000_000_000;
const shares = {
    airdrop: total * 0.25,
    ecosystem: total * 0.25,
    team: total * 0.26,
    investors: total * 0.24
}

const lighter: Protocol = {
    "Team": manualLinear(start + periodToSeconds.year, start + periodToSeconds.years(4), shares.team),
    "Investors": manualLinear(start + periodToSeconds.year, start + periodToSeconds.years(4), shares.investors),
    "Seasons 1 and 2 Airdrop": manualCliff(start, shares.airdrop),
    "Ecosystem allocation": manualCliff(start, shares.ecosystem),
    meta: {
        notes: [
        "The remaining ecosystem allocation after the airdrop will be used for future points seasons, partnerships and growth initiatives.",
        ],
        token: "coingecko:lighter",
        sources: ["https://x.com/Lighter_xyz/status/2005862682608472263"],
        protocolIds: ["parent#lighter"],
        total,
    },
    categories: {
        insiders: ["Team", "Investors"],
        noncirculating: ["Ecosystem allocation"],
        airdrop: ["Seasons 1 and 2 Airdrop"],
    },
};
export default lighter;
