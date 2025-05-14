import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1639526400;
const totalSupply = 500_000_000_000_000;

const communityIncentive = totalSupply * 0.509;
const team = totalSupply * 0.23;
const ecosystem = totalSupply * 0.13;
const networkSecurity = totalSupply * 0.13;
const airdrop = totalSupply * 0.001;

const tectonic: Protocol = {
  "Team": manualStep(
    start,
    periodToSeconds.month,
    48,
    team / 48,
  ),
  "Ecosystem Reserve": manualCliff(
    start,
    ecosystem,
  ),
  "Network Security & Maintenance": manualCliff(
    start,
    networkSecurity,
  ),
  "Airdrop": manualCliff(
    start,
    airdrop,
  ),
  "Community Incentives": manualLinear(
    start,
    start + periodToSeconds.years(10),
    communityIncentive,
  ),

  meta: {
    token: "coingecko:tectonic",
    sources: ["https://medium.com/tectonicfi/tonic-tokenomics-and-airdrop-660b519e81c6"],
    protocolIds: ["1115"],
    notes: [],
  },

  categories: {
    airdrop: ["Airdrop"],
    insiders: ["Team"],
    noncirculating: ["Ecosystem Reserve", "Network Security & Maintenance"],
    farming: ["Community Incentives"],
  }
};

export default tectonic;
