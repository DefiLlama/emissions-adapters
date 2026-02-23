import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryDune } from "../utils/dune";
import { periodToSeconds } from "../utils/time";

const start = 1763942400; // 2025-11-24
const initialSupply = 100_000_000_000;
const shares = {
    ecosystem: initialSupply * 0.385,
    team: initialSupply * 0.163,
    investors: initialSupply * 0.197,
    publicSale: initialSupply * 0.075,
    categoryLabsTreasury: initialSupply * 0.0395,
    airdrop: initialSupply * 0.033
}
async function stakingRewards(): Promise<CliffAdapterResult[]> {
    const result: CliffAdapterResult[] = [];
    const issuanceData = await queryDune("6728904", true)

    for (let i = 0; i < issuanceData.length; i++) {
    result.push({
        type: "cliff",
        start: issuanceData[i].date,
        amount: issuanceData[i].amount
    });
    }
    return result;
}

const monad: Protocol = {
    "Public Sale": manualCliff(start, shares.publicSale),
    "Airdrop": manualCliff(start, shares.airdrop),
    "Ecosystem Development": manualCliff(start, shares.ecosystem),
    "Team": [manualCliff(start + periodToSeconds.year, initialSupply * 0.107), manualLinear(start + periodToSeconds.year, start + periodToSeconds.years(4), shares.team)],
    "Investors": [manualCliff(start + periodToSeconds.year, shares.investors * 0.25), manualStep(start + periodToSeconds.year, periodToSeconds.month, 36, (shares.investors * 0.75) / 36)],
    "Category Labs Treasury": [manualCliff(start + periodToSeconds.year, shares.categoryLabsTreasury * 0.25), manualStep(start + periodToSeconds.year, periodToSeconds.month, 36, (shares.categoryLabsTreasury * 0.75) / 36)],
    "Staking Rewards": stakingRewards,
    meta: {
        token: "coingecko:monad",
        sources: ["https://www.monad.xyz/announcements/mon-tokenomics-overview"],
        chain: "monad",
        protocolIds: ["7443"],
    },
    categories: {
        insiders: ["Team", "Category Labs Treasury"],
        privateSale: ["Investors"],
        noncirculating: ["Ecosystem Development"],
        airdrop: ["Airdrop"],
        publicSale: ["Public Sale"],
        staking: ["Staking Rewards"]
    },
};
export default monad;
