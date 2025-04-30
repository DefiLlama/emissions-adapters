import { LinearAdapterResult, Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1608163200;
const totalSupply = 10_000_000_000; //initial supply

// Allocation percentages of total supply
//community
const community = totalSupply * 0.35;
const graphFoundation = community * 0.58;
const strategicGRT = community * 0.06;
const publicGRT = community * 0.12;
const curatorProgramGrants = community * 0.09;
const testnetIndexerRewards = community * 0.09;
const bugBounty = community * 0.01;
const educationalProgram = community * 0.06;

const earlyBackers = totalSupply * 0.17;
const earlyTeam = totalSupply * 0.23;
const backers = totalSupply * 0.17;
const edgeAndNode = totalSupply * 0.08;

function calculateInflationEmissions(): LinearAdapterResult[] {
  const sections: LinearAdapterResult[] = [];
  const yearlyInflationRate = 0.03; // 3%
  const numberOfYears = 5;
  
  for (let year = 0; year < numberOfYears; year++) {
      // Calculate emission for this year
      // For each year, we take 3% of the initial supply
      const yearlyEmission = totalSupply * yearlyInflationRate;
      
      sections.push(manualLinear(
          start + periodToSeconds.years(year),
          start + periodToSeconds.years(year + 1),
          yearlyEmission
      ));
  }

  return sections;
}

const thegraph: Protocol = {
  "Early Backers": manualCliff(start + periodToSeconds.months(6), earlyBackers),
  "Backers": manualCliff(start + periodToSeconds.months(12), backers),

  "Educational Program": manualCliff(start, educationalProgram),
  "Bug Bounty": manualCliff(start, bugBounty),
  
  "Public GRT Sale": manualCliff(start, publicGRT),

  "Strategic GRT Sale": [
    manualCliff(start, 140_700_000), // 15% at TGE
    manualLinear(
      start + periodToSeconds.months(6),
      start + periodToSeconds.months(12),
      strategicGRT - 140_700_000 // Remaining 85%
    ),
  ],
  "Testnet Indexer Rewards": manualLinear(start + periodToSeconds.year, start + periodToSeconds.years(2), testnetIndexerRewards),
  "Early Team & Advisors": manualLinear(start + periodToSeconds.months(7), start +periodToSeconds.years(4), earlyTeam), //start at july 2021
  "Curator Program Grants": [
    manualCliff(start, curatorProgramGrants * 0.10),
    manualStep(
      start + periodToSeconds.months(3),
      periodToSeconds.months(3),
      16,
      curatorProgramGrants * 0.90 / 16
    )
  ],
  "Edge & Node":[
    manualCliff(start, edgeAndNode * 0.01),
    manualLinear(
      start,
      start + periodToSeconds.years(5),
      edgeAndNode * 0.99 // Remaining 90%
    )
  ],

  "Graph Foundation": [
    manualCliff(start, graphFoundation * 0.046),
    manualLinear(
      start,
      start + periodToSeconds.years(10),
      graphFoundation * 0.954 // Remaining 95.4%
    )
  ],

  "New Issuance": calculateInflationEmissions(),

  meta: {
    token: "coingecko:the-graph",
    sources: ["https://thegraph.com/blog/announcing-the-graphs-grt-sale/"],
    protocolIds: ["5010"],
    notes: [
      "Early Backers & Backers allocations are locked up ranging from 6 months to 2 years, but in this case we are assumming that early backers are unlocked after 6 months and backers after 12 months.",
      "Public GRT Sale is vague, but it is assumed that it is unlocked at TGE.",
      "Graph Foundation allocation at start is 4.6% and the rest is assumed to be unlocked over 10 years",
      "New Issuance are assumed to increase the supply by 3% per year and modeled for 5 years, but this can be changed in the future.",
    ]
  },

  categories: {
    noncirculating: ["Graph Foundation","Curator Program Grants","New Issuance","Educational Program","Bug Bounty"],
    publicSale: ["Public GRT Sale","Testnet Indexer Rewards"],
    privateSale: ["Backers","Early Backers","Strategic GRT Sale"],
    insiders: ["Early Team & Advisors","Edge & Node"],
  },
};

export default thegraph;