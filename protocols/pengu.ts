import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1734393600;
const totalSupply = 88_888_888_888;

const team = totalSupply * 0.178;
const liquidity = totalSupply * 0.1235;
const community = totalSupply * 0.259;
const company = totalSupply * 0.1148;
const othercommunity = totalSupply * 0.2412;
const fttholders = totalSupply * 0.0035;
const proliferation = totalSupply * 0.04;
const publicGood = totalSupply * 0.04;

const pengu: Protocol = {
  "Community": manualCliff(
    start,
    community
  ),
  "Other Community": manualCliff
  (
    start,
    othercommunity
  ),
  "Liquidity": manualCliff(
    start,
    liquidity
  ),
  "Public Good": manualCliff(
    start,
    publicGood
  ),
  "Proliferation": manualCliff(
    start,
    proliferation
  ),
  "FTT Holders": manualCliff(
    start,
    fttholders,
  ),
  "Current & Future Team":
  manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(4),
    team
  ),
  "Company":
  manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(4),
    company
  ),

  
  meta: {
    token: "coingecko:pengu",
    sources: ["https://x.com/pudgypenguins/status/1864852026212983067/"],
    protocolIds: ["6146"],
    notes: [
      "Only Team and Company allocation are locked for 1 year and then linearly vests over 3 years, the rest are unlocked at TGE.",
    ]
  },

  categories: {
    insiders: ["Current & Future Team", "Company"],
    liquidity: ["Liquidity"],
    airdrop: ["FTT Holders"],
  }
};

export default pengu;
