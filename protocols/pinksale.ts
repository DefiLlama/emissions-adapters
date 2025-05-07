import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const start = 1627430400;
const totalSupply = 100_000;

const teamPct = 0.16;
const marketingPct = 0.08;
const advisoryPct = 0.06;
const privatePct = 0.08;
const publicPct = 0.04;
const rewardsPct = 0.40;
const ecosystemPct = 0.12;
const liquidityPct = 0.06;

const teamAmount = totalSupply * teamPct;
const marketingAmount = totalSupply * marketingPct;
const advisoryAmount = totalSupply * advisoryPct;
const privateAmount = totalSupply * privatePct;
const publicAmount = totalSupply * publicPct;
const rewardsAmount = totalSupply * rewardsPct;
const ecosystemAmount = totalSupply * ecosystemPct;
const liquidityAmount = totalSupply * liquidityPct;

const pinksale: Protocol = {
    "Rewards": manualLinear(
        start,
        start + periodToSeconds.years(8),
        rewardsAmount,
    ),
    "Exchange Liquidity": manualCliff(
        start,
        liquidityAmount * 0.50,
    ),
    "Team": manualStep(
        start + periodToSeconds.month * 12,
        periodToSeconds.month,
        33,
        teamAmount / 33,
    ),
    "Marketing": manualStep(
        start + periodToSeconds.month * 3,
        periodToSeconds.month,
        23,
        marketingAmount / 23,
    ),
    "Advisory": manualStep(
        start + periodToSeconds.month * 3,
        periodToSeconds.month,
        12,
        advisoryAmount / 12,
    ),
    "Private Round": [
        manualCliff(start, privateAmount * 0.10), 
        manualCliff(start + periodToSeconds.month * 1, privateAmount * 0.20), 
        manualCliff(start + periodToSeconds.month * 2, privateAmount * 0.20), 
        manualCliff(start + periodToSeconds.month * 3, privateAmount * 0.20), 
        manualCliff(start + periodToSeconds.month * 4, privateAmount * 0.30), 
    ],
    "Public Round": [
        manualCliff(start, publicAmount * 0.30),
        manualStep(
            start,
            periodToSeconds.week * 2,
            2,
            publicAmount * 0.35,
        ),
    ],

    "Ecosystem": manualStep(
        start + periodToSeconds.month * 3,
        periodToSeconds.month,
        23,
        ecosystemAmount / 23,
    ),


    meta: {
        notes: [
            "Public Round '35% every 2 weeks' interpreted as two distinct releases of 35% of the total public allocation each, occurring 2 and 4 weeks after TGE.",
            "The remaining 50% of Exchange Liquidity (3% of total supply) is reserved for future listings and is not included in this emission schedule.",
        ],
        sources: ["https://web.archive.org/web/20210727000818/https://docs.pinksale.finance/token-metrics"],
        token: "coingecko:pinksale",
        protocolIds: ["1807"],
    },
    categories: {
        insiders: ["Team", "Marketing", "Advisory"],
        privateSale: ["Private Round"],
        publicSale: ["Public Round"],
        farming: ["Rewards"],
        noncirculating: ["Ecosystem"],
        liquidity: ["Exchange Liquidity"],
    },
};

export default pinksale;