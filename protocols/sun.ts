import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1599436800;
const totalSupply = 19_900_730_000;

// Allocation percentages of total supply
const genesisV1 = totalSupply * 0.0935;
const officialMining = totalSupply * 0.1559;
const justlend = totalSupply * 0.0118;
const century = totalSupply * 0.0247;
const genesisV2 = totalSupply * 0.042;
const governanceMining = totalSupply * 0.1905;
const veCRVAirdrop = totalSupply * 0.01;
const sunDAO = totalSupply * 0.4716;

const sun: Protocol = {
  "Genesis Mining (V1)": manualCliff(start, genesisV1),
  "Official Mining (V1)": manualCliff(start, officialMining),
  "JustLend Mining (V1)": manualCliff(start, justlend),
  "Century Mining (V1)": manualCliff(start, century),
  "veCRV Airdrop (V2)": manualCliff(start, veCRVAirdrop),
  "Genesis Mining (V2)": manualCliff(start, genesisV2),
  "Governance Mining (V2)": manualCliff(start, governanceMining),
  "SUN DAO (V2)": manualLinear(
    start,
    start + periodToSeconds.years(4),
    sunDAO,
  ),


  meta: {
    token: "tron:TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S",
    sources: ["https://docs.sun.io/get-start/tokenomics/sun-tokenomics"],
    protocolIds: ["431"],
    notes: [
      "According to the docs, only SUN DAO allocation that are linearly vested over 4 years, the rest are unlocked immediately.",
    ]
  },

  categories: {
    farming: [
      "Genesis Mining (V1)",
      "Official Mining (V1)",
      "JustLend Mining (V1)",
      "Century Mining (V1)",
      "Genesis Mining (V2)",
      "Governance Mining (V2)",
    ],
    airdrop: [
      "veCRV Airdrop (V2)",
    ],
    noncirculating: [
      "SUN DAO (V2)",
    ],
  },
};

export default sun;