import { manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const bitcoin: Protocol = {
  "Mining rewards": [
    manualLinear(1609632000, 1620774000, 546113),
    manualLinear(1620774000, 1637452800, 0),
    manualLinear(1714395314, 1760335406, 9953887),
    manualLinear(1760335406, 1886335406, 5250000),
    manualLinear(1886335406, 2012335406, 2625000),
    manualLinear(2012335406, 2138335406, 1312500),
    manualLinear(2138335406, 2390335406, 656250),
    manualLinear(2390335406, 2516335406, 328125),
    manualLinear(2516335406, 2642335406, 164063),
    manualLinear(2642335406, 2768335406, 82031),
    manualLinear(2768335406, 2894335406, 41016),
    manualLinear(2894335406, 3020335406, 20508),
    manualLinear(3020335406, 3146335406, 10254),
  ],
  meta: {
    sources: [
      "https://taostats.io/tokenomics/",
      "https://opentensor.medium.com/tao-token-economy-explained-17a3a90cd44e",
    ],
    token: "coingecko:bittensor",
    protocolIds: ["4547"],
    notes: [
      `Future halvenings have at a specified block height, therefore the dates shown are an estimate only.`,
    ],
    chain: 'bittensor'
  },
  categories: {
    farming: ["Mining rewards"],
  },
};

export default bitcoin;
