import { manualLinear, manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const INTR_TGE = 1647043200; // 12 March 2022
const totalSupply = 1_000_000_000; // Total INTR Supply over the first 4 years

const interlay: Protocol = {
    "Stake-to-Vote Rewards": manualCliff(INTR_TGE, totalSupply * 0.05), // On a per-block basis No vesting
    "Foundation Reserve": manualCliff(INTR_TGE, totalSupply * 0.1), // Not liquid until spent. Vesting to be defined for each individual spend
    "Vault Rewards": manualCliff(INTR_TGE, totalSupply * 0.3), // On a per-block basis No vesting
    "On-chain Treasury": manualCliff(INTR_TGE, totalSupply * 0.25), // Allocation at launch, no vesting
    "1st Crowdloan Airdrop": [
        manualCliff(INTR_TGE, totalSupply * 0.10 * 0.30), // 30% liquid at TGE
        manualLinear(
            INTR_TGE,
            INTR_TGE + periodToSeconds.week * 96, // Approx. 96 weeks
            totalSupply * 0.10 * 0.70
        ) // 70% linearly vested over ~96 weeks
    ],    
    "Team & Early Backers": [
        manualCliff(
            INTR_TGE + periodToSeconds.week * 48, // 48 weeks lockup
            totalSupply * 0.20 * 0.25 // 25% after cliff
        ),
        manualLinear(
            INTR_TGE + periodToSeconds.week * 48, // Start after lockup
            INTR_TGE + periodToSeconds.week * 192, // 144 weeks linear vesting
            totalSupply * 0.20 * 0.75 // Remaining 75%
        )
    ],

    meta: {
        token: "",
        sources: ["https://docs.interlay.io/#/learn/tokenomics"],
        protocolIds: ["2033"],
    },
    categories: {
        airdrop: ["1st Crowdloan Airdrop"],
        noncirculating: ["On-chain Treasury", "Foundation Reserve"],
        farming: ["Vault Rewards", "Stake-to-Vote Rewards"],
        insiders: ["Team & Early Backers"]
    },
};

export default interlay;