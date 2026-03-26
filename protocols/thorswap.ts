import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { queryTransferEvents } from "../utils/queries";
import { months, readableToSeconds } from "../utils/time";

const start = 1634688000 // 2021-10-20
const total = 500_000_000
const token = "0xa5f2211b9b8170f694421f2046281775e8468044"
const stakingRewards = "0x8f631816043c8e8cad0c4c602bfe7bff1b22b182"
const community = "0x426c0d1dcf6b6facd5618577f6c3eafe4e5c3373"
const burnAddress = "0x000000000000000000000000000000000000dead"

const shares = {
    treasury: total * 0.1,
    airdrop: total * 0.05,
    public: total * 0.1,
    privateInvestors: total * 0.1,
    contributors: total * 0.15,
    community: total * 0.5
}

async function getTransfers() {
    const data = await queryTransferEvents({
      contractAddress: token,
      fromAddress: community,
      startDate: "2022-05-05"
    })
    const staking = data.filter((row: any) => row.to_address === stakingRewards)
    .map(d => ({
      type: "cliff" as const,
      start: readableToSeconds(d.date),
      amount: Number(d.amount) / 1e18,
    }))
    const farming = data.filter((row: any) => row.to_address !== stakingRewards && row.to_address !== burnAddress)
    .map(d => ({
      type: "cliff" as const,
      start: readableToSeconds(d.date),
      amount: Number(d.amount) / 1e18,
    }))
    return { farming, staking}
}

const thorswap: Protocol = {
    "Airdrop": manualCliff(start, shares.airdrop),
    "Public Sale": manualCliff(start, shares.public),
    "Treasury": manualCliff(start, shares.treasury),
    "Core Contributors": manualLinear(start, months(start, 36), shares.contributors),
    "Private Investors": manualLinear(start, months(start, 24), shares.privateInvestors),
    "Community Incentives": async () => (await getTransfers()).farming,
    "Staking Rewards": async () => (await getTransfers()).staking,
    meta: {
        token: "coingecko:thorswap",
        sources: [
            "https://docs.thorswap.finance/thorswap/thor/about/thor-tokenomics",
            "https://docs.thorswap.finance/thorswap/thor/about/thor-burn"
        ],
        notes: [
            "The community allocation was originally 50% of the supply and used to pay staking rewards and incentives, but the majority of this allocation was burned",
        ],
        protocolIds: ["6941"],
    },
    categories: {
        noncirculating: ["Treasury"],
        publicSale: ["Public Sale"],
        privateSale: ["Private Investors"],
        airdrop: ["Airdrop"],
        insiders: ["Core Contributors"],
        staking: ["Staking Rewards"],
        farming: ["Community Incentives"]
    },
};

export default thorswap;
