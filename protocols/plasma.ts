import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1758758400; // 2025-09-25
const initialSupply = 10_000_000_000
const ecosystemUnlocksSteps = Math.floor(((start + periodToSeconds.years(3)) - start) / periodToSeconds.month)
const teamUnlocksSteps = Math.floor(((start + periodToSeconds.years(2)) - start) / periodToSeconds.month)

const shares = {
    publicSale: initialSupply * 0.1,
    investors: initialSupply * 0.25,
    ecosystem: initialSupply * 0.32, // Plus 8% at mainnet launch
    team: initialSupply * 0.25
}

const plasma: Protocol = {
    "Public Sale": manualCliff(start, shares.publicSale),
    "Ecosystem & Growth": [manualCliff(start, initialSupply * 0.08), manualStep(start, periodToSeconds.month, ecosystemUnlocksSteps, shares.ecosystem / ecosystemUnlocksSteps )],
    "Team": [manualCliff(start + periodToSeconds.year, shares.team / 3), manualStep(start + periodToSeconds.year, periodToSeconds.month, teamUnlocksSteps, ((shares.team / 3) * 2)  / teamUnlocksSteps)],
    "Investors": [manualCliff(start + periodToSeconds.year, shares.investors / 3), manualStep(start + periodToSeconds.year, periodToSeconds.month, teamUnlocksSteps, ((shares.investors / 3) * 2) / teamUnlocksSteps)],
    meta: {
        notes: [
            "Public Sale tokens for US purchasers have a 12-month lockup, but are shown here as fully unlocked at TGE for simplicity",
            "Validator rewards are not included since they are not live yet"
        ],
        token: "coingecko:plasma",
        sources: [
            "https://www.plasma.to/docs/get-started/xpl/tokenomics"
        ],
        chain: "plasma",
        protocolIds: ["7444"]
    },
    categories: {
        publicSale: ["Public Sale"],
        insiders: ["Team"],
        privateSale: ["Investors"],
        farming: ["Ecosystem & Growth"]
    },
};
export default plasma;

