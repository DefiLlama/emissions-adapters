import { Protocol } from "../types/adapters";
import { manualLinear, manualStep, manualCliff } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 1e9; 
const start = 1648425600; 

const cow: Protocol = {
    "Community Airdrop": manualCliff(start, 100e6),
    "DAO Treasury": manualCliff(start, 444e6),
    "Advisory": manualLinear(start, start + periodToSeconds.year * 4, 6e6),
    "Community Investment Options": manualLinear(start, start + periodToSeconds.year * 4, 100e6),
    "Private Investment Round": manualLinear(start, start + periodToSeconds.year * 4, 100e6),
    "Gnosis DAO": manualLinear(start, start + periodToSeconds.year * 4, 100e6),
    "Team": manualLinear(start, start + periodToSeconds.year * 4, 150e6),
    meta: {
        notes: [
            `The emission and distribution details are based on the proposed and intended token emission and distribution for CoW Protocol.`,
            `The exact details might vary based on real-time decisions and governance.`,
        ],
        sources: [
            "https://blog.cow.fi/cow-token-is-moving-forward-at-full-speed-d9f047a23b57", 
        ],
        token: "ethereum:0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab", 
        protocolIds: ["2643"],
    },
    categories: {
        farming: ["Community Investment Options"],
        noncirculating: ["DAO Treasury"],
        insiders: ["Team", "Gnosis DAO", "Private Investment Round", "Advisory"],
        airdrop: ["Community Airdrop"]
    },
};

export default cow;