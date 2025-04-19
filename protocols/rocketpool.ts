import { Protocol } from "../types/adapters";
import { rocketPoolEmissions } from "../adapters/rocketpool";
import { manualCliff } from "../adapters/manual";

const startOld = 1504742400; // old RPL token start date

const rocketpool: Protocol = {
    "Pre-Sale Investors": manualCliff(startOld, 9_720_000),
    "Public Sale": manualCliff(startOld, 5_580_000),
    "Rocket Pool Team": manualCliff(startOld, 2_700_000),

    "Node Operator Rewards": async () => {
        const results = await rocketPoolEmissions();
        return [results[0]];
    },
    "Protocol DAO Rewards": async () => {
        const results = await rocketPoolEmissions();
        return [results[2]];
    },
    "Trusted Node Rewards": async () => {
        const results = await rocketPoolEmissions();
        return [results[1]];
    },
    meta: {
        sources: [
            "https://medium.com/rocket-pool/rocket-pool-staking-protocol-part-3-3029afb57d4c",
            "https://www.bybit.com/en/coin-price/rocket-pool/",
            "https://github.com/rocket-pool/rocketpool/blob/master/contracts/contract/dao/protocol/settings/RocketDAOProtocolSettingsInflation.sol"
        ],
        token: `ethereum:0xD33526068D116cE69F19A9ee46F0bd304F21A51f`,
        protocolIds: ["900"],
        notes: [
            "Public Sale, Pre-Sale Investors, and Team allocations are based on old RPL token",
            "RocketPool uses a compound inflation model where new RPL tokens are minted at regular intervals.",
            "Emissions are split between Node Operators, Trusted Node Operators (oDAO), and the Protocol DAO based on configured percentages on that time.",
            "The percentages at start are 70% for Node Operators, 15% for Trusted Node Operators, and 15% for the Protocol DAO according to the docs. However, these percentages are subject to change over time. In this analysis we will track it correctly using onchain data",
        ]
    },
    categories: {
        insiders: ["Pre-Sale Investors", "Rocket Pool Team"],
        publicSale: ["Public Sale"],
        farming: ["Node Operator Rewards", "Trusted Node Rewards"],
        noncirculating: ["Protocol DAO Rewards"]
    }
};

export default rocketpool;
