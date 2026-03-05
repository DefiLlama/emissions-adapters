import { manualCliff } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { queryDailyNetOutflows } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const total = 1_000_000_000
const start = 1703376000 // 2023-12-24
const token = "0x44ff8620b8ca30902395a7bd3f2407e1a091bf73"

async function getOutflows() {
    const data = await queryDailyNetOutflows({
      token: token,
      address: "0x37672dda85f3cb8da4098baac5d84e00960cb081",
      startDate: "2023-12-24"
    })
    return data.map(d => ({
      type: "cliff" as const,
      start: readableToSeconds(d.date),
      amount: Number(d.amount),
    }))
}

const virtuals: Protocol = {
    "Public Distribution": manualCliff(start, total * 0.6),
    "Liquidity": manualCliff(start, total * 0.05),
    "Ecosystem": getOutflows,
    meta: {
        notes: [
            "The Ecosystem allocation sits in a DAO-controlled multisig and it's deployed only after receiving governance approval",
            "The circulating supply from the Ecosystem allocation is calculated by tracking the net outflows from this address: 0x37672dda85f3cb8da4098baac5d84e00960cb081"
        ],
        token: "coingecko:virtual-protocol",
        sources: [
            "https://whitepaper.virtuals.io/info-hub/usdvirtual/token-distribution",
            "https://etherscan.io/token/0x44ff8620b8cA30902395A7bD3F2407e1A091BF73?a=0x37672dda85f3cb8da4098baac5d84e00960cb081"
        ],
        protocolIds: ["5575"],
    },
    categories: {
        liquidity: ["Liquidity"],
        airdrop: ["Public Distribution"],
        farming: ["Ecosystem"],
    },
};
export default virtuals;
