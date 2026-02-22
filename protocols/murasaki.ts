import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1671667200 // 2022-12-22
const total = 1_000_000_000

const murasaki: Protocol = {
    "Seed Investors": [manualCliff(start, total * 0.02), manualLinear(start, start + periodToSeconds.months(20), total * 0.04)],
    "Private Sale": [manualCliff(start, total * 0.02), manualLinear(start, start + periodToSeconds.months(20), total * 0.10)],
    "Advisors": manualLinear(start + periodToSeconds.year, start + periodToSeconds.year + periodToSeconds.months(10), total * 0.02),
    "Team": manualLinear(start + periodToSeconds.year, start + periodToSeconds.year + periodToSeconds.months(15), total * 0.15),
    "Mura Labs": manualCliff(start, total * 0.1),
    "Ecological": [manualCliff(start, total * 0.15), manualLinear(start, start + periodToSeconds.months(20), total * 0.05)],
    "Mining Pool": manualLinear(start + periodToSeconds.months(6), start + periodToSeconds.months(6) + periodToSeconds.months(35), total * 0.35),
    meta: {
        token: "coingecko:murasaki",
        sources: [
            "https://medium.com/@IdolMurasaki/mura-tokenomics-c16124d90e5e",
            "https://murasaki.club/docs/murasaki_deck.pdf"
        ],
        protocolIds: ["7429"],
        total,
    },
    categories: {
        insiders: ["Team", "Seed Investors", "Advisors", "Mura Labs"],
        privateSale: ["Private Sale"],
        farming: ["Ecological", "Mining Pool"]
    },
};
export default murasaki;