import { Protocol } from "../types/adapters";
import { manualStep, manualLog, manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1594771200; 
const tradingRewardsStart = 1595116800;
const weeklyUnlockAmount = 75e3; 
const teamStart = 1609459200;

const rarible: Protocol = {
    "Team and Investors": manualLinear( teamStart, teamStart + periodToSeconds.year * 2, 7.5e6 ),
    "Airdrop": manualStep(
        start, 
        periodToSeconds.day, 
        1, 
        25e5 
    ),
    "Trading Rewards":[ 
      manualCliff(tradingRewardsStart, weeklyUnlockAmount),
      manualStep( tradingRewardsStart, periodToSeconds.week, 200, weeklyUnlockAmount),
    ],
    meta: {
        notes: [
            "Token allocation and distribution are based on Rarible's governance and token economics.",
            "Trading rewards are distributed weekly over a 200-week period, starting from July 15, 2020."
        ],
        sources: ["https://www.bybit.com/en/web3/raiders/47"], 
        token: "ethereum:0xfca59cd816ab1ead66534d82bc21e7515ce441cf",
        protocolIds: ["2504"],
    },
    categories: {
        insiders: ["Team and Investors"],
        airdrop: ["Airdrop"],
        farming: ["Trading Rewards"],
    },
};

export default rarible;