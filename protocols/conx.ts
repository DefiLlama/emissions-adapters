import { Protocol } from "../types/adapters";
import { manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1694736000;
const totalSupply = 100_000_000;

const ecosystem = totalSupply * 0.35;
const community = totalSupply * 0.2;
const marketing = totalSupply * 0.15;
const foundation = totalSupply * 0.15;
const team = totalSupply * 0.1;
const advisor = totalSupply * 0.03;
const earlyAdopter = totalSupply * 0.02;

const connex: Protocol = {
  "Early Adopter Reward": manualCliff(
    start,
    earlyAdopter
   ),
   "Marketing": [
    manualCliff(start, marketing * 0.06),
    manualStep(
      start,
      periodToSeconds.month,
      20,
      (marketing * 0.94) / 20
    )
   ],
   "Ecosystem": [
    manualCliff(start, ecosystem * 0.06),
    manualStep(
      start,
      periodToSeconds.month,
      40,
      (ecosystem * 0.94) / 40
    )
   ],
   "Community Treasury": manualStep(
    start,
    periodToSeconds.month,
    40,
    community / 40
   ),
   
   "Foundation": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    15,
    foundation / 15
   ),
   "Team": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    10,
    team / 10
   ),
   "Advisor & Partner": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    10,
    advisor / 10
   ),

  meta: {
    token: "coingecko:connex",
    sources: ["https://connex.gitbook.io/connex/conx-token/distribution"],
    protocolIds: ["6144"],
    notes: [
    ]
  },

  categories: {
    insiders: ["Team", "Advisor & Partner"],
    noncirculating: ["Community Treasury", "Foundation", "Ecosystem", "Marketing"],
  }
};

export default connex;
