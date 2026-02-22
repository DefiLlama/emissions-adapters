import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1764720000; // 2025-12-03
const total = 1_000_000_000;

const generalUnlockSchedule = (allocation: number) => manualStep(start, periodToSeconds.months(6), 4, total * (allocation / 4))

const humidifi: Protocol = {
    "ICO": manualCliff(start, total * 0.10),
    "Foundation": [manualCliff(start, total * 0.08), generalUnlockSchedule(0.32)],
    "Ecosystem": [manualCliff(start, total * 0.05), generalUnlockSchedule(0.2)],
    "Labs": generalUnlockSchedule(0.25),
    meta: {
        token: "coingecko:humidifi",
        sources: ["https://www.humidifi.xyz/tokenomics"],
        protocolIds: ["6554"],
        total,
    },
    categories: {
        publicSale: ["ICO"],
        insiders: ["Labs", "Foundation"],
        farming: ["Ecosystem"],
    },
};
export default humidifi;
