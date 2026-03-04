import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryDune } from "../utils/dune";
import { months } from "../utils/time";

const start = 1560902400; // 2019-06-19
const initialSupply = 500_000_000;
const shares = {
    seed: initialSupply * 0.05,
    ido: initialSupply * 0.16,
    team: initialSupply * 0.1,
    community: initialSupply * 0.12,
    operational: initialSupply * 0.12
}
async function stakingRewards(): Promise<CliffAdapterResult[]> {
    const result: CliffAdapterResult[] = [];
    const issuanceData = await queryDune("6778023", true)

    for (let i = 0; i < issuanceData.length; i++) {
    result.push({
        type: "cliff",
        start: issuanceData[i].date,
        amount: issuanceData[i].amount
    });
    }
    return result;
}

const thorchain: Protocol = {
    "IDO & Public Sale": manualCliff(start, shares.ido),
    "Operational Reserves": manualLinear(start, months(start, 40), shares.operational),
    "Community": manualLinear(start, months(start, 60), shares.community),
    "Seed Investors": manualLinear(months(start, 3), months(start, 18), shares.seed),
    "Team & Advisors": manualLinear(months(start, 3), months(start, 18), shares.team),
    "Staking Rewards": stakingRewards,
    meta: {
        token: "coingecko:thorchain",
        sources: [
            "https://medium.com/thorchain/thorchain-rune-initial-dex-offering-665ad81e74c9",
            "https://medium.com/thorchain/reduction-in-rune-total-supply-a8913adace82",
            "https://medium.com/thorchain/project-surtr-rune-burn-program-800bc28d1e75",
            "https://dev.thorchain.org/concepts/economic-model.html?highlight=emission#emission-schedule"
        ],
        chain: "thorchain",
        protocolIds: ["412"],
    },
    categories: {
        insiders: ["Team & Advisors", "Operational Reserves"],
        privateSale: ["Seed Investors"],
        farming: ["Community"],
        publicSale: ["IDO & Public Sale"],
        staking: ["Staking Rewards"]
    },
};
export default thorchain;
