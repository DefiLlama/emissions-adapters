import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const start = 1629331200;
const totalQty = 7_200_000_000;
const duration_seconds = 31536000 / 4;

const benqi: Protocol = {
  "Liquidity Mining Program": manualCliff(start, totalQty * 0.45),
  //"Token Sale": manualCliff(start, (totalQty * 0.25)),
  "Seed Round": manualLinear(start, 1692403200, totalQty * 0.05),
  "Private Round": manualLinear(start, 1660867200, totalQty * 0.13),
  "Public A": manualLinear(start, 1663545600, totalQty * 0.053),
  //"Public B": manualLinear(start, 1663545600, (totalQty*0.017)),
  //"Exchange Liquidity": manualCliff(start, totalQty * 0.05),
  Treasury: [
    //manualCliff(start, (totalQty * 0.15) * 0.1875),
    manualLinear(1652918400, 1779148800, totalQty * 0.15),
  ],
  Team: [manualStep(1660867200, duration_seconds, 16, totalQty * 0.0125)],

  meta: {
    sources: ["https://docs.benqi.fi/benqinomics/token-distribution"],
    token: "avax:0x8729438eb15e2c8b576fcc6aecda6a148776c0f5",
    protocolIds: ["467"],
  },
  categories: {
    farming: ["Liquidity Mining Program"],
    noncirculating: ["Treasury"],
    insiders: ["Seed Round", "Team"],
    publicSale: ["Public A"],
  },
};

export default benqi;
