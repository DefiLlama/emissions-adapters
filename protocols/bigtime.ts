import { manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const chain = "ethereum";
const address = "0x64bc2ca1be492be7185faa2c8835d9b824c8a194";
const start = 1696896000;
const total = 5e9;

const altlayer: Protocol = {
  "Community / Marketing": manualLinear(
    start,
    start + periodToSeconds.years(7),
    total * 0.2,
  ),
  "Player Rewards": manualStep(
    start,
    periodToSeconds.months(6),
    6,
    total * 0.1,
  ),
  "Ecosystem / Treasury": manualStep(
    start,
    periodToSeconds.months(6),
    6,
    (total * 0.2) / 6,
  ),
  meta: {
    sources: [
      "https://wiki.bigtime.gg/big-time-economy/economy-components/resources/usdbigtime-tokens",
    ],
    token: `${chain}:${address}`,
    protocolIds: ["4644"],
  },
  categories: {
    noncirculating: ["Ecosystem / Treasury"],
    farming: ["Community / Marketing", "Player Rewards"],
  },
};
export default altlayer;
