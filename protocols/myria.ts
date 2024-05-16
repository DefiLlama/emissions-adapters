import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 50e9;
const start = 1679659200;

const node = () => {
  let daily = 12e6;
  let thisStart = start;
  const sections = [];
  for (let i = 0; i < 6; i++) {
    sections.push(
      manualLinear(
        thisStart,
        thisStart + periodToSeconds.year * 2,
        daily * 730.5,
      ),
    );
    daily /= 2;
    thisStart += periodToSeconds.year * 2;
  }
  return sections;
};

const myria: Protocol = {
  "Ecosystem Fund": manualLinear(
    start,
    start + periodToSeconds.year * 3,
    qty * 0.4,
  ),
  "TGE & Liquidity": manualCliff(start, qty * 0.03),
  "Strategic Reserve": manualCliff(start, qty * 0.02),
  Team: [
    manualCliff(start + periodToSeconds.month * 6, (qty * 0.19) / 8),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.month * 48,
      (qty * 0.19 * 7) / 8,
    ),
  ],
  "Node Emissions": node(),
  meta: {
    sources: ["https://myria.com/token/"],
    notes: [],
    token: "ethereum:0xa0ef786bf476fe0810408caba05e536ac800ff86",
    protocolIds: ["4613"],
  },
  categories: {
    publicSale: ["TGE & Liquidity"],
    farming: ["Node Emissions"],
    noncirculating: ["Strategic Reserve", "Ecosystem Fund"],
    insiders: ["Team"],
  },
};

export default myria;
