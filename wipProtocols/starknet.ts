import { Protocol } from "../types/adapters";
import { manualLinear, manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 10_000_000_000; // 10 billion 
const start = 1708430400; // February 20, 2024 12pm


// calculation for Investors and Early Contributors
        const combinedAllocationPercentage = 0.3821; // 38.21%
        const combinedAllocation = totalSupply * combinedAllocationPercentage; // Combined allocation

        // Initial cliffs
        const initialCliffPercentage = 0.131; // 13.1% of combined allocation
        const april30CliffPercentage = 0.004; // 0.4% of combined allocation

        const initialCliffAmount = combinedAllocation * initialCliffPercentage; 
        const april30CliffAmount = combinedAllocation * april30CliffPercentage;

        // Equally distributed cliffs
        const eachInitialCliffAmount = initialCliffAmount / 2;
        const eachApril30CliffAmount = april30CliffAmount / 2;

        // Calculating remaining allocations after initial cliffs
        const remainingAfterCliffs = combinedAllocation - (initialCliffAmount + april30CliffAmount);
        const remainingEachAfterCliffs = remainingAfterCliffs / 2; // Divide the remainder equally

        // Corrected Unix timestamps for unlock dates
        const unlockDate1 = 1713139200; // April 15, 2024
        const unlockDate2 = 1714435200; // April 30, 2024
        const monthlyReleaseStart = unlockDate2;


const starknet: Protocol = {
    "Community Provisions": manualCliff(start, totalSupply * 0.09),
    "StarkWare": manualLinear(start, start + periodToSeconds.year * 4, totalSupply * 0.1076),
    "Grants including DPs": manualLinear(start, start + periodToSeconds.year * 4, totalSupply * 0.1293),
    "Community Rebates": manualLinear(start, start + periodToSeconds.year * 4, totalSupply * 0.09),
    "Foundation Strategic Reserves": manualLinear(start, start + periodToSeconds.year * 4, totalSupply * 0.1),
    "Foundation Treasury": manualLinear(start, start + periodToSeconds.year * 4, totalSupply * 0.081),
    "Donations": manualLinear(start, start + periodToSeconds.year * 4, totalSupply * 0.02),
    "Early Contributors": [
        manualCliff(unlockDate1, eachInitialCliffAmount), // Half of 13.1% unlocked on April 15, 2024
        manualCliff(unlockDate2, eachApril30CliffAmount), // Half of 0.4% unlocked on April 30, 2024
        manualStep(monthlyReleaseStart, periodToSeconds.month, 31, remainingEachAfterCliffs / 31) // Distribute the remaining allocation
    ],
    "Investors": [
        manualCliff(unlockDate1, eachInitialCliffAmount), // Half of 13.1% unlocked on April 15, 2024
        manualCliff(unlockDate2, eachApril30CliffAmount), // Half of 0.4% unlocked on April 30, 2024
        manualStep(monthlyReleaseStart, periodToSeconds.month, 31, remainingEachAfterCliffs / 31) // Distribute the remaining allocation
    ],
    meta: {
        notes: [
            "Distribution based on Starknet Foundation's plan. Details may vary based on governance decisions."
        ],
        sources: [
            "https://docs.starknet.io/documentation/architecture_and_concepts/Economics-of-Starknet/#supply_and_distribution"
        ],
        token: "starknet:0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", // L2 address
        protocolIds: [""],
    },
    categories: {
        insiders: ["Early Contributors", "Investors", "Donations"],
        noncirculating: ["Foundation Strategic Reserves", "Foundation Treasury", "StarkWare", "Grants including DPs"],
        airdrop: ["Community Provisions"],
        liquidity: ["Community Rebates"]
    },
};

export default starknet;