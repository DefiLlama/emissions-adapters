import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1680480000;
const total = 1e10;

const wormhole: Protocol = {
  "Guardian Nodes": manualStep(
    start,
    periodToSeconds.year,
    4,
    (total * 0.051) / 4,
  ),
  "Community & Launch": [
    manualCliff(start, total * 0.11),
    manualCliff(start + periodToSeconds.months(4), total * 0.06),
  ],
  "Ecosystem & Incubation": [
    manualCliff(start, total * 0.05),
    manualStep(start, periodToSeconds.year, 4, (total * 0.26) / 4),
  ],
  "Core Contributors": [
    manualCliff(start + periodToSeconds.year, total * 0.06),
    manualCliff(start + periodToSeconds.years(2), total * 0.03),
    manualCliff(start + periodToSeconds.years(3), total * 0.03),
  ],
  "Strategic Network Participants": manualStep(
    start,
    periodToSeconds.year,
    4,
    (total * 0.116) / 4,
  ),
  "Foundation Treasury": [
    manualCliff(start, total * 0.02),
    manualLinear(start, start + periodToSeconds.months(50), total * 0.213),
  ],
  meta: {
    sources: ["https://wormhole.com/blog/wormhole-w-tokenomics"],
    token: "coingecko:wormhole",
    notes: [
      `Data has been inferred from the graph shown in the source material.`,
    ],
    protocolIds: ["1541"],
  },
  categories: {
    insiders: [
      "Guardian Nodes",
      "Ecosystem & Incubation",
      "Core Contributors",
      "Strategic Network Participants",
    ],
    airdrop: ["Community & Launch"],
    noncirculating: ["Foundation Treasury"],
  },
};
export default wormhole;
