import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1483228800; // 2017-01-01
const xdcPerEpoch = 250;
const blocksPerEpoch = 900;

async function getEmissions(): Promise<CliffAdapterResult[]> {
    const data = await fetch("https://xdcscan.com/chart/blocks?output=csv")
    const text = await data.text()
    const rows = text.trim().split("\n");
    return rows
        .map((row) => {
            const [, timestamp, blocks] = row.split(",").map((s) => s.replace(/"/g, ""));
            const epochs = Number(blocks) / blocksPerEpoch;
            return { type: "cliff" as const, start: Number(timestamp), amount: epochs * xdcPerEpoch };
        })
        .filter((r) => !isNaN(r.start) && !isNaN(r.amount)); 
}

const xdc: Protocol = {
    "Founders and Team": manualLinear(start, start + periodToSeconds.years(14),15_000_000_000),
    "Ecosystem Development": manualLinear(start, start + periodToSeconds.years(11), 10_000_000_000),
    "Contingency Fund": manualCliff(start, 2_500_000_000),
    "Pre-Placement": manualCliff(start, 10_000_000_000),
    "Staking Rewards": getEmissions,
    meta: {
        notes: [
        "The Contingency Fund allocation is held for ongoing network maintenance and operational needs; vesting details are not publicly disclosed.",
        "The Pre-Placement allocation was distributed to early investors and exchanges",
        "Staking rewards are estimated from daily block counts (via XDCScan). Each epoch is 900 blocks, and 250 XDC is minted per epoch as validator rewards."
        ],
        token: "coingecko:xdce-crowd-sale",
        sources: [
            "https://xinfin.org/docs/xdc-mica-whitepaper.pdf",
            "https://xdcscan.com/chart/blocks"
        ],
        chain: "xdc",
        protocolIds: ["7441"]
    },
    categories: {
        insiders: ["Founders and Team"],
        noncirculating: ["Contingency Fund"],
        farming: ["Ecosystem Development"],
        privateSale: ["Pre-Placement"],
        staking: ["Staking Rewards"]
    },
};
export default xdc;
