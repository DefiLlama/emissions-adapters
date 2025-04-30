import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const total = 5e8;
const start = 1738800000;

const schedule = (qty: number) => [
  manualCliff(start + periodToSeconds.year, qty / 6),
  manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    (qty * 5) / 6,
  ),
];

const berachain: Protocol = {
  "Ecosystem & R&D": [
    manualCliff(start, total * 0.095),
    schedule(total * 0.105),
  ],
  Airdrop: manualCliff(start, total * 0.158),
  Investors: schedule(total * 0.343),
  "Initial Core Contributors": schedule(total * 0.168),
  "Community Initiatives": schedule(total * 0.131),
  meta: {
    sources: [
      "https://docs.berachain.com/learn/pol/tokens/tokenomics#overview",
    ],
    token: "coingecko:berachain-bera",
    protocolIds: ["5770"],
  },
  categories: {
    farming: ["Community Initiatives"],
    airdrop: ["Airdrop"],
    privateSale: ["Investors"],
    insiders: ["Initial Core Contributors","Ecosystem & R&D"],
  },
};

export default berachain;
