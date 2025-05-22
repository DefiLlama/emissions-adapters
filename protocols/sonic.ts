import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { LinearAdapterResult, Protocol } from "../types/adapters";

const launchDate = 1735948800;
const initialTotalSupply = 3_175_000_000;

const migratedFtmAmount = 2_880_000_000;
const airdropAmount = 190_500_000;
const initialBlockRewardsAmount = 295_000_000;
const fundingAmountPerYear = initialTotalSupply * 0.015;

const airdropClaimStart = launchDate + periodToSeconds.months(6);
const airdropVestEnd = airdropClaimStart + periodToSeconds.days(270);
const initialRewardsEnd = launchDate + periodToSeconds.years(4);
const fundingStart = launchDate + periodToSeconds.months(6);

const inflation = () => {
    const sections: LinearAdapterResult[] = [];
    const yearlyInflationRate = 0.0175; //this depends on staked Sonic at the time, therefore it's assumed to be 1.75% for simplicity
    const monthlyInflationRate = yearlyInflationRate / 12;
  
    let start = launchDate + periodToSeconds.years(4);
    let total = initialTotalSupply;
  
    //calculate for 15 years of inflation
    const numberOfMonths = 15 * 12;
  
    for (let i = 0; i < numberOfMonths; i++) {
      const amount = total * monthlyInflationRate;
  
      sections.push({
        type: "linear",
        start,
        end: start + periodToSeconds.month,
        amount,
      });
  
      total += amount;
      start += periodToSeconds.month;
    }
  
    return sections;
}

const sonic: Protocol = {
  "Migrated FTM": manualCliff(launchDate, migratedFtmAmount),
  "Airdrop Season 1": [
    manualCliff(airdropClaimStart, airdropAmount * 0.25),
    manualLinear(
      airdropClaimStart,
      airdropVestEnd, 
      airdropAmount * 0.75
    ),
  ],
  "Initial Block Rewards": manualLinear(
    launchDate,
    initialRewardsEnd,
    initialBlockRewardsAmount
  ),
  "Ongoing Funding": manualStep(
    fundingStart,
    periodToSeconds.year,
    6,
    fundingAmountPerYear
  ),
  "Block Rewards": inflation(),


  meta: {
    notes: [
      "There will be no new minted coins for the first 4 years, all block rewards comes from migrated FTM block rewards.",
      "Ongoing Funding is modeled without accounting for the burn.",
      "Airdrop Season 1 have unique system, where user can choose to claim 25% of their airdrop at the start, and the rest can be claimed fully after 9 months. However they can claim it earlier with a penalty. In our model we assumed that all users will claim it at the end of the vesting.",
      "Block rewards after initial block rewards will depends on the amount of staked Sonic, therefore we assumed it to be 1.75% for simplicity.",
    ],
    sources: [
      "https://docs.soniclabs.com/sonic/s-token",
      "https://blog.soniclabs.com/designing-a-deflationary-airdrop/",
    ],
    token: "coingecko:sonic-3",
    protocolIds: ["6105"], 
    chain: "sonic"
  },
  categories: {
    noncirculating: ["Ongoing Funding"],
    airdrop: ["Airdrop Season 1"],
    farming: ["Initial Block Rewards", "Block Rewards"],
  },
};

export default sonic;