import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";


const totalQty = 1_000_000_000;

const looksrare: Protocol = {
    "Airdrop": manualCliff(1642204800, totalQty * 0.12),
    "Liquidity Management": manualCliff(1642204800,totalQty * 0.017),
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
    "Founding Team": manualStep(1642204800, periodToSeconds.day * 180, 4,  totalQty * 0.025),
    
    "Treasury": manualStep(1642204800, periodToSeconds.day * 90, 8,  totalQty * 0.0125),

  

  sources: [
    "https://docs.frax.finance/token-distribution/frax-share-fxs-distribution",
  ],
  token: "ethereum:0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0",
  protocolIds: ["1229"],
};

export default looksrare;