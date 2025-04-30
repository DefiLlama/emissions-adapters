import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1698886800;
const total = 69e9;

const meme: Protocol = {
  Airdrop: [
    manualCliff(start, total * 0.05),
    manualStep(start, periodToSeconds.days(180), 4, total * 0.05),
  ],
  "Community Presale": [
    manualCliff(start, total * 0.0275),
    manualLinear(start, start + periodToSeconds.days(540), total * 0.0825),
  ],
  Ecosystem: [
    manualCliff(start, total * 0.03),
    manualLinear(start, start + periodToSeconds.days(720), total * 0.27),
  ],
  "Private Sale": [
    manualCliff(start + periodToSeconds.days(180), total * 0.012),
    manualLinear(
      start + periodToSeconds.days(180),
      start + periodToSeconds.days(1440),
      total * 0.108,
    ),
  ],
  Contributors: manualLinear(
    start + periodToSeconds.days(360),
    start + periodToSeconds.days(1440),
    total * 0.17,
  ),
  "Binance Launchpool": manualCliff(start, total * 0.02),
  Advisory: [
    manualCliff(start, total * 0.015),
    manualCliff(start + periodToSeconds.days(360), total * 0.015),
  ],
  meta: {
    notes: [
      `In this analysis we have assumed linear unlock schedules where no schedule has been given in the source material.`,
      `By inspecting the chart in the source material we have inferred a 180 day 4 step unlock for the remaining airdrop allocation (20%)`,
    ],
    token: "coingecko:memecoin-2",
    sources: [`https://www.memecoin.org/about`],
    protocolIds: ["4919"],
  },
  categories: {
    airdrop: ["Airdrop"],
    publicSale: ["Community Presale","Binance Launchpool"],
    noncirculating: ["Ecosystem"],
    privateSale: ["Private Sale"],
    insiders: ["Contributors"],
  },
};

export default meme;
