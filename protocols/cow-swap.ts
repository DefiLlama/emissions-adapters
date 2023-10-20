import { Protocol } from "../types/adapters";
import { manualLinear, manualStep, manualCliff } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 1e9; 
const start = 1648166400; 

const cow: Protocol = {
    "CoWmunity Airdrop": manualCliff(start, totalSupply * 0.05),
    "CoW DAO Treasury": manualCliff(start, totalSupply * 0.571),
    "CoW Advisory": manualLinear(start, start + periodToSeconds.year * 4, totalSupply * 0.006),
    "CoWmunity Investment": manualLinear(start, start + periodToSeconds.year * 4, totalSupply * 0.025),
    "Investment Round": manualLinear(start, start + periodToSeconds.year * 4, totalSupply * 0.096),
    "GnosisDAO": manualLinear(start, start + periodToSeconds.year * 4, totalSupply * 0.10),
    "Team": manualLinear(start, start + periodToSeconds.year * 4, totalSupply * 0.15),
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
        farming: [],
        noncirculating: ["CoW DAO Treasury"],
        insiders: ["Team", "GnosisDAO", "Investment Round", "CoW Advisory"],
        airdrop: ["CoWmunity Airdrop", "CoWmunity Investment"]
    },
};

export default cow;