import { Protocol } from "../types/adapters";
import { getHermesEmissions } from "../adapters/hermes";

const hermesV2: Protocol = {
  "Gauge Emissions": () => getHermesEmissions("gauge"),
  "Rebase Emissions": () => getHermesEmissions("rebase"),
  "DAO Share": () => getHermesEmissions("dao"),

  meta: {
    token: "arbitrum:0x45940000009600102A1c002F0097C4A500fa00AB",
    sources: ["https://docs.maiadao.io/"],
    protocolIds: ["parent#maia-dao-ecosystem"],
    notes: [
      "Ongoing emissions tracked from on-chain Mint events from the BaseV2Minter contract and TokenUnstaked events from the UniswapV3 staker.",
      "Gauge emissions are distributed weekly to Hermes UniswapV3 Gauges via FlywheelGaugeRewards.",
      "Rebase emissions go to the bHERMES vault for stakers.",
      "DAO share is allocated to the protocol treasury.",
    ],
  },

  categories: {
    farming: ["Gauge Emissions"],
    noncirculating: ["DAO Share", "Rebase Emissions"],
  },
};

export default hermesV2;
