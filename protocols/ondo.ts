import { Protocol } from "../types/adapters";
import { manualLinear, manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const totalSupply = 10_000_000_000;
const publicLaunchDate = 1705536000; // UNIX timestamp for jan 18, 2024

const ondo: Protocol = {
    "Community Access Sale": [
        manualCliff(publicLaunchDate, (totalSupply * 0.019884411) * 0.90),
        manualLinear(publicLaunchDate, publicLaunchDate + periodToSeconds.month * 12, (totalSupply * 0.019884411) * 0.10020267635788)
    ],
    "Ecosystem Growth": [
        manualCliff(publicLaunchDate, totalSupply * 0.5210869545 * 0.24),
        manualStep(publicLaunchDate, periodToSeconds.month * 12, 5, totalSupply * 0.5210869545 * 0.76 / 5)
    ],
    "Protocol Development": [
        
        manualStep(publicLaunchDate + periodToSeconds.month * 12, periodToSeconds.month * 12, 4, totalSupply * 0.33 * 0.25)
    ],
    "Private Sales": [
        
        manualStep(publicLaunchDate + periodToSeconds.month * 12, periodToSeconds.month * 12, 4, totalSupply * 0.1290246044 * 0.25)
    ],


    meta: {
        sources: ["https://blog.ondo.foundation/unlocking-ondo-a-proposal-from-the-ondo-foundation/"],
        token: "ethereum:0xfaba6f8e4a5e8ab82f62fe7c39859fa577269be3",
        protocolIds: ["2542"],
    },
    categories: {
        publicSale: ["Community Access Sale"],
        noncirculating: ["Ecosystem Growth"],
        insiders: ["Private Sales","Protocol Development"]
    },
};

export default ondo;