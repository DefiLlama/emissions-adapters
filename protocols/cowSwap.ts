import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { queryDailyOutflows } from "../utils/queries";
import { readableToSeconds, years } from "../utils/time";

const start = 1648425600; // 2022-03-28
const total = 1_000_000_000;
const shares = {
    team: total * 0.15,
    gnosisDAO: total * 0.10,
    airdrop: total * 0.10,
    communityInvestment: total * 0.10,
    advisory: total * 0.006,
    investmentRound: total * 0.10,
}
const solverRewards = "0xA03be496e67Ec29bC62F01a428683D7F9c204930"
const token = "0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab"

async function getSolverRewards() {
    const data = await queryDailyOutflows({
      token: token,
      fromAddress: solverRewards,
      startDate: "2022-03-28"
    })
    return data.map(d => ({
      type: "cliff" as const,
      start: readableToSeconds(d.date),
      amount: Number(d.amount),
    }))
}

const cowSwap: Protocol = {
    "CoWmunity Airdrop": manualCliff(start, shares.airdrop),
    "Team": manualLinear(start, years(start, 4), shares.team),
    "GnosisDAO": manualLinear(start, years(start, 4), shares.gnosisDAO),
    "CoWmunity Investment": manualLinear(start, years(start, 4), shares.communityInvestment),
    "Investment Round": manualLinear(start, years(start, 4), shares.investmentRound),
    "CoW Advisory": manualLinear(start, years(start, 4), shares.advisory),
    "Solver Rewards": getSolverRewards,
    meta: {
        notes: [
            "vCOW tokens vest linearly over 4 years from deployment for team, advisors, investors, and GnosisDAO.",
            "The DAO treasury holds a significant portion of the token supply for long-term governance, ecosystem growth, partnerships, and grants. These tokens are not circulating because they're not in the hands of individual users or entities who can trade them freely."
        ],
        token: "coingecko:cow-protocol",
        sources: ["https://docs.cow.fi/governance/token"],
        protocolIds: ["2643"],
        total,
    },
    categories: {
        insiders: ["Team", "CoW Advisory", "GnosisDAO"],
        privateSale: ["Investment Round"],
        airdrop: ["CoWmunity Airdrop"],
        publicSale: ["CoWmunity Investment"],
        farming: ["Solver Rewards"],
    },
};
export default cowSwap;
