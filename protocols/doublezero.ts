import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1759363200; // 2025-10-02
const total = 10_000_000_000;

const shares = {
    foundationAndEcosystem: total * 0.29,
    jump: total * 0.23, // plus 5% at tge
    malbec: total * 0.14,
    team: total * 0.10,
    institutions: total * 0.12,
    contributors: total * 0.04,
    builders: total * 0.02,
    validators: total * 0.01,
};
const year = (n: number) => Math.round((start + periodToSeconds.years(n)) / 86400) * 86400;
const standardUnlock = (amount: number) => [
    manualCliff(year(1), amount / 4),
    manualLinear(year(1), year(4), (amount * 3) / 4)    
]

const doublezero: Protocol = {
    "DoubleZero Foundation and Ecosystem": manualCliff(start, shares.foundationAndEcosystem),
    "Jump Crypto": [
        manualCliff(start, total * 0.05),
        ...standardUnlock(shares.jump),
    ],
    "Malbec Labs": standardUnlock(shares.malbec),
    "Team": standardUnlock(shares.team),
    "Institutions": standardUnlock(shares.institutions),
    "Contributors": standardUnlock(shares.contributors),
    "Builders": standardUnlock(shares.builders),
    "Validators Sale": [
        manualCliff(start, total * 0.007),
        manualCliff(year(1), total * 0.003),
    ],
    meta: {
        notes: [
            "Inflationary emissions to reward contributors and stakers are proposed but not yet live",
        ],
        token: "coingecko:doublezero",
        sources: [
            "https://doublezero.xyz/2z-tokenomics-disclosure.pdf",
            "https://doublezero.xyz/journal/the-duality-of-doublezero-staking",
            "https://doublezero.xyz/journal/a-primer-to-the-2z-token",
            "https://doublezero.xyz/journal/inflation-and-network-security"
        ],
        protocolIds: ["parent#doublezero"],
        total,
    },
    categories: {
        insiders: [
            "Jump Crypto",
            "Malbec Labs",
            "Team",
            "Builders",
        ],
        privateSale: [
            "Institutions",
            "Validators Sale",
        ],
        noncirculating: ["DoubleZero Foundation and Ecosystem"],
        farming: ["Contributors"]
    },
};
export default doublezero;
