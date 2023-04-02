import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1646092800;
const qty = 69_420_000_000;

const jpegd: Protocol = {
  team: manualLinear(
    start + 6 * periodToSeconds.month,
    start + (6 * periodToSeconds.month + 2 * periodToSeconds.year),
    qty * 0.3,
  ),
  advisors: manualLinear(
    start + 6 * periodToSeconds.month,
    start + (6 * periodToSeconds.month + 2 * periodToSeconds.year),
    qty * 0.05,
  ),
  "donation event": manualCliff(start, qty * 0.3),
  treasury: manualCliff(start, qty * 0.35),

  token: "ethereum:0xE80C0cd204D654CEbe8dd64A4857cAb6Be8345a3",
  sources: ["https://docs.jpegd.io/jpegd-dao/tokenomics/supply-graph"],
  protocolIds: ["1619"],
};

export default jpegd;
