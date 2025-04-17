import { Protocol } from "../types/adapters";
import { pancakeRegular, pancakeSpecial } from "../adapters/pancakeswap";

const pancakeswap: Protocol = {
    "Regular Farming": pancakeRegular,
    "Special Ecosystem": pancakeSpecial,
    meta: {
        sources: [
            "https://docs.pancakeswap.finance/protocol/cake-tokenomics",
            "https://docs.pancakeswap.finance/welcome-to-pancakeswap/how-to-guides/v3-v2-migration/migration/masterchef-v2"
        ],
        token: `bsc:0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82`,
        protocolIds: ["parent#pancakeswap"],
        notes: [
            "In addition to emissions above, PancakeSwap also mint CAKE to dev address at rate of 9.09%, however it's burned weekly and never enters circulation. Therefore it's not included in this analysis.",
        ]
    },
    categories: {
        farming: ["Regular Farming"],
        noncirculating: ["Special Ecosystem"]
    },
};

export default pancakeswap;
