import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1758067200; // 2025-09-17
const total = 8_000_000_000;
const shares = {
    initialAirdrop: total * 0.088,
    remainingAirdrops: total * 0.447,
    ecosystem: total * 0.30,
    treasury: total * 0.07,
    team: total * 0.05,
    liquidity: total * 0.045
}

const aster: Protocol = {
    "Airdrop": [manualCliff(start, shares.initialAirdrop), manualLinear(start, start + periodToSeconds.months(80), shares.remainingAirdrops)],
    "Ecosystem & Community": manualLinear(start, start + periodToSeconds.months(20), shares.ecosystem),
    "Treasury": manualCliff(start, shares.treasury),
    "Initial Liquidity": manualCliff(start, shares.liquidity),
    "Team": manualLinear(start + periodToSeconds.year, start + periodToSeconds.months(40), shares.team),
    meta: {
        notes: [
        "8.8% of the total supply was airdropped at TGE, the remaining airdrop allocation will be gradually released over the next 80 months.",
        "The treasury allocation will not enter circulating supply after TGE and remain fully locked until utilized via governance-approved mechanisms"
        ],
        token: "coingecko:aster-2",
        sources: ["https://docs.asterdex.com/usdaster/tokenomics"],
        protocolIds: ["parent#astherus"],
        total,
    },
    categories: {
        insiders: ["Team"],
        farming: ["Ecosystem & Community"],
        publicSale: ["Initial Liquidity"],
        noncirculating: ["Treasury"],
        airdrop: ["Airdrop"],
    },
};
export default aster;
