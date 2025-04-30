import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1733961600;
const totalSupply = 100_000_000;

// Allocation percentages of total supply
const treasury = totalSupply * 0.1;
const incentives = totalSupply * 0.15;
const airdrop = totalSupply * 0.40;
const team = totalSupply * 0.15;
const investors = totalSupply * 0.2;  

const send: Protocol = {
  "Save, Ecosystem, Suilend Airdrop": manualCliff(start, airdrop),
  "Team": manualLinear(start, start + periodToSeconds.months(48), team),
  "Investors": manualLinear(start, start + periodToSeconds.months(24), investors),

  meta: {
    token: "coingecko:suilend",
    sources: ["https://docs.suilend.fi/send/tokenomics-and-mdrops"],
    protocolIds: ["4274"],
    notes: [
      "Incentives and Treasury unlock are not specified in the source, therefore it's not included.",
    ]
  },

  categories: {
    airdrop: ["Save, Ecosystem, Suilend Airdrop"],
    privateSale: ["Investors"],
    insiders: ["Team"],
  },
};

export default send;