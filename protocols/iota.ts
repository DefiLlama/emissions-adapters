import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds, unixTimestampNow } from "../utils/time";

const start = 1696377600; // 2023-10-04
const rebasedStart = 1746403200 // 2025-05-05
const stardustTotal = 4_600_000_000
const iotaPerEpoch = 767_000;
const daysElapsed = Math.floor((unixTimestampNow() - rebasedStart) / periodToSeconds.day)

const biweeklyUnlocks = (totalAmount: number, duration: number) => {
    const steps = duration / periodToSeconds.weeks(2)
    return manualStep(start, periodToSeconds.weeks(2), steps, totalAmount / steps)
}
const shares = {
    tangleEcosystem: stardustTotal * 0.12,
    iotaFoundation: stardustTotal * 0.07075,
    iotaDLTFoundation: stardustTotal * 0.12,
    contributors: stardustTotal * 0.05,
    airdrop: stardustTotal * 0.035
}

const iota: Protocol = {
    "IOTA Holders": manualCliff(start, 2_529_939_788),
    "Unclaimed Tokens": manualCliff(start, 176_304_541),
    "Treasury DAO": manualCliff(start, 54_896_344),
    "Contributors": [manualCliff(start, shares.contributors * 0.1), manualLinear(start, start + periodToSeconds.months(24), shares.contributors * 0.9)],
    "Airdrop": [manualCliff(start, shares.airdrop * 0.1), biweeklyUnlocks(shares.airdrop * 0.9, periodToSeconds.months(24))],
    "Tangle Ecosystem Association": [manualCliff(start, shares.tangleEcosystem * 0.1), biweeklyUnlocks(shares.tangleEcosystem * 0.9, periodToSeconds.years(4))],
    "IOTA Foundation": [manualCliff(start, shares.iotaFoundation * 0.1), biweeklyUnlocks(shares.iotaFoundation * 0.9, periodToSeconds.years(4))],
    "IOTA DLT Foundation": [manualCliff(start, shares.iotaDLTFoundation * 0.1), biweeklyUnlocks(shares.iotaDLTFoundation * 0.9, periodToSeconds.years(4))],
    "Staking Rewards": manualStep(rebasedStart, periodToSeconds.day, daysElapsed, iotaPerEpoch),
    meta: {
        notes: [
            "The Unclaimed Tokens allocation was removed from circulation until valid claims are processed.",
            "Staking rewards (767k IOTA/epoch) began at the Rebase upgrade on May 5, 2025.",
            "Locked tokens from the Stardust vesting schedule can be delegated to validators to earn staking rewards."
        ],
        token: "coingecko:iota",
        sources: [
            "https://blog.iota.org/stardust-upgrade-iota-tokenomics/",
            "https://blog.iota.org/iota-rebased-technical-view/"
        ],
        chain: "iota",
        protocolIds: ["7442"]
    },
    categories: {
        publicSale: ["IOTA Holders"],
        insiders: ["Contributors", "IOTA Foundation"],
        noncirculating: ["Unclaimed Tokens", "Treasury DAO", "Tangle Ecosystem Association", "IOTA DLT Foundation"],
        staking: ["Staking Rewards"],
        airdrop: ["Airdrop"]
    },
};
export default iota;

