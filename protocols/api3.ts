import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1606741200;
const qty = 100_000_000_000;

const api3: Protocol = {
  Team: manualLinear(start, start + periodToSeconds.year * 3, qty * 0.3),
  Contributors: manualLinear(start, start + periodToSeconds.year * 3, qty * 0.10),
  Seed: manualLinear(start, start + periodToSeconds.year * 2, qty * 0.15),
  Treasury: manualCliff(start, qty * 0.25),
  PublicDistribution: manualCliff(start, qty * 0.2),
  token: "coingecko:api3",
  sources: ["https://medium.com/api3/api3-public-token-distribution-event-1acb3b6d940"],
  protocolIds: [],
};

export default api3;