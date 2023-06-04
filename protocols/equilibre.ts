import { LinearAdapterResult, Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const initialSupply = 40000000;
const startTimestamp = 1677117405;

const emissions = (portion: number): LinearAdapterResult[] => {
  const totalWeeks = 52 * 5;
  const weeklyDecayRate = 0.01;
  let amount = initialSupply * 0.046;
  let start = startTimestamp;
  const sections: LinearAdapterResult[] = [];
  for (let i = 0; i < totalWeeks; i++) {
    sections.push({
      type: "linear",
      amount: amount * portion,
      start,
      end: start + periodToSeconds.week,
    });
    amount *= 1 - weeklyDecayRate;
    start += periodToSeconds.week;
  }
  return sections;
};

const equilibre: Protocol = {
  Emissions: emissions(0.94),
  Community: manualCliff(startTimestamp, initialSupply * 0.1),
  Team: [
    manualCliff(startTimestamp, initialSupply * 0.15),
    manualLinear(
      startTimestamp,
      startTimestamp + periodToSeconds.month * 3,
      2100000,
    ),
    manualLinear(
      startTimestamp,
      startTimestamp + periodToSeconds.month * 6,
      1200000,
    ),
    emissions(0.06),
  ],
  Grants: manualCliff(startTimestamp, initialSupply * 0.4),
  Airdrop: manualCliff(startTimestamp, initialSupply * 0.01),
  Liquidity: manualCliff(startTimestamp, initialSupply * 0.0025),
  meta: {
    sources: [
      "https://equilibre-finance.gitbook.io/equilibre-v1/protocol-overview/tokenomics/emissions",
      "https://equilibre-finance.gitbook.io/equilibre-v1/protocol-overview/tokenomics/initial-distribution",
    ],
    token: "vara:0xE1da44C0dA55B075aE8E2e4b6986AdC76Ac77d73",
    protocolIds: ["566"],
  },
  sections: {
    farming: ["Community"],
    publicSale: ["Liquidity"],
    airdrop: ["Airdrop"],
    noncirculating: ["Grants"],
    insiders: ["Team"],
  },
};

export default equilibre;
