import { Protocol } from "../types/adapters";
import { manualLinear, manualCliff } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const total = 100_000_000_000; // 100 billion
const start = 1719356400;

const blast: Protocol = {
  "Blast Points": manualCliff(start, total * 0.07),
  "Blast Gold": manualCliff(start, total * 0.07),
  "Blur Foundation": manualCliff(start, total * 0.03),
  "Blast Foundation": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.08,
  ),
  Community: manualLinear(
    start,
    start + periodToSeconds.years(3),
    total * 0.33,
  ),
  Investors: [
    manualCliff(start + periodToSeconds.year, 4129943290),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      12389829868,
    ),
  ],
  "Core Contributors": [
    manualCliff(start + periodToSeconds.year, 6370056710),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      19110170132,
    ),
  ],
  meta: {
    notes: [
      `Blur Foundation airdrop has been allocated for undisclosed future airdrops. Here we have shown an instant unlock as the schedule unconfirmed.`,
      `Top ~1000 wallets will vest part of their airdrop linearly over 6 months. This hasnt been accounted for as there is not enough detail in the source material.`,
    ],
    sources: ["https://docs.blast.io/tokenomics"],
    token: "coingecko:blast",
    protocolIds: ["4236"],
    chain: 'blast'
  },
  categories: {
    airdrop: ["Blast Points","Blast Gold","Blur Foundation"],
    farming: ["Community"],
    noncirculating: ["Blast Foundation"],
    privateSale: ["Investors"],
    insiders: ["Core Contributors"],
  },
};

export default blast;
