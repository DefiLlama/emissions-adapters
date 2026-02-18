import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const totalQty = 1000000000;
const teamUnlock = 1655766000;
const start = teamUnlock - periodToSeconds.day * 180;
const looksrare: Protocol = {
  Airdrop: manualCliff(start, totalQty * 0.12),
  "Liquidity Management": manualCliff(start, totalQty * 0.017),
  "Volume Rewards": [
    manualLinear(
      start,
      start + periodToSeconds.day * 30,
      totalQty * 0.441 * 0.25,
    ),
    manualLinear(
      start + periodToSeconds.day * 30,
      start + periodToSeconds.day * 120,
      totalQty * 0.441 * 0.25,
    ),
    manualLinear(
      start + periodToSeconds.day * 120,
      start + periodToSeconds.day * 360,
      totalQty * 0.441 * 0.25,
    ),
    manualLinear(
      start + periodToSeconds.day * 360,
      start + periodToSeconds.day * 720,
      totalQty * 0.441 * 0.25,
    ),
  ],
  "Staking Rewards": [
    manualLinear(
      start,
      start + periodToSeconds.day * 30,
      totalQty * 0.189 * 0.25,
    ),
    manualLinear(
      start + periodToSeconds.day * 30,
      start + periodToSeconds.day * 120,
      totalQty * 0.189 * 0.25,
    ),
    manualLinear(
      start + periodToSeconds.day * 120,
      start + periodToSeconds.day * 360,
      totalQty * 0.189 * 0.25,
    ),
    manualLinear(
      start + periodToSeconds.day * 360,
      start + periodToSeconds.day * 720,
      totalQty * 0.189 * 0.25,
    ),
  ],
  "Strategic Sale": manualCliff(teamUnlock, totalQty * 0.033),
  "Founding Team": manualStep(
    teamUnlock,
    periodToSeconds.day * 180,
    4,
    totalQty * 0.025,
  ),
  Treasury: manualStep(
    start + periodToSeconds.day * 90,
    periodToSeconds.day * 90,
    8,
    totalQty * 0.0125,
  ),
  meta: {
    sources: ["https://docs.looksrare.org/about/looks-tokenomics"],
    token: "ethereum:0xf4d2888d29D722226FafA5d9B24F9164c092421E",
    protocolIds: ["1229"],
  },
  categories: {
    airdrop: ["Airdrop"],
    farming: ["Volume Rewards"],
    staking: ["Staking Rewards"],
    noncirculating: ["Treasury"],
    privateSale: ["Strategic Sale"],
    insiders: ["Founding Team"],
  },
};

export default looksrare;
