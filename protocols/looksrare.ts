import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const totalQty = 1000000000;

const looksrare: Protocol = {
  Airdrop: manualCliff(1642204800, totalQty * 0.12),
  "Liquidity Management": manualCliff(1642204800, totalQty * 0.017),
  "Volume Rewards": [
    manualLinear(1642204800, 1652227200, totalQty * 0.11025),
    manualLinear(1652227200, 1672617600, totalQty * 0.11025),
    manualLinear(1672617600, 1700956800, totalQty * 0.11025),
    manualLinear(1700956800, 1700956800, totalQty * 0.11025),
  ],
  "Staking Rewards": [
    manualLinear(1642204800, 1652227200, totalQty * 0.04725),
    manualLinear(1652227200, 1672617600, totalQty * 0.04725),
    manualLinear(1672617600, 1700956800, totalQty * 0.04725),
    manualLinear(1700956800, 1700956800, totalQty * 0.04725),
  ],
  "Strategic Sale": manualCliff(1657843200, totalQty * 0.033),
  "Founding Team": manualStep(
    1642204800,
    periodToSeconds.day * 180,
    4,
    totalQty * 0.025,
  ),
  Treasury: manualStep(
    1642204800,
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
    farming: ["Volume Rewards", "Staking Rewards"],
    insiders: ["Strategic Sale", "Founding Team"],
    noncirculating: ["Treasury"],
  },
};

export default looksrare;
