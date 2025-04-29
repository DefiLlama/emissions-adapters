import { manualLinear, manualCliff } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1602633600; // Oct 14, 2020
const startMainnet = 1608633600; // Dec 22, 2020
const TARGET_WEEK = 520;

const emissions = (): LinearAdapterResult[] => {
  const result: LinearAdapterResult[] = [];
  let currentWeek = 0;
  
  result.push({
    type: "linear",
    start: startMainnet,
    end: startMainnet + periodToSeconds.weeks(1),
    amount: 1_200_000
  });
  currentWeek++;

  for (let week = 0; week < 5 && currentWeek < TARGET_WEEK; week++) {
    result.push({
      type: "linear", 
      start: startMainnet + periodToSeconds.weeks(currentWeek),
      end: startMainnet + periodToSeconds.weeks(currentWeek + 1),
      amount: 4_400_000
    });
    currentWeek++;
  }

  while (currentWeek < TARGET_WEEK) {
    result.push({
      type: "linear",
      start: startMainnet + periodToSeconds.weeks(currentWeek),
      end: startMainnet + periodToSeconds.weeks(currentWeek + 1), 
      amount: 1_300_000
    });
    currentWeek++;
  }

  return result;
};

const flow: Protocol = {
  "Dapper Labs": manualCliff(start, 250_000_000),
  "Ecosystem Reserve": manualCliff(start, 400_200_000),
  "Staking Rewards": emissions(),

  "Community Sale": [
    manualCliff(start + periodToSeconds.year, 45_000_000),
    manualLinear(start + periodToSeconds.year, start + periodToSeconds.years(2), 45_000_000)
  ],

  "Auction": manualCliff(start + periodToSeconds.year, 25_000_000),

  "Pre-launch Backers": manualCliff(start + periodToSeconds.years(2), 259_800_000), //from flow post about the circulating updates, where it combine pre launch backer and community sale

  "Development Team": manualLinear(
    start,
    start + periodToSeconds.years(3),
    225_000_000
  ),
  

  
  meta: {
    notes: [
      "Initial token allocations totaling 1.25B FLOW:",
      "- Pre-launch backers and community (374.8M FLOW) were fully unlocked in October 2022",
      "- Development team (225M FLOW) vested over 3 years from October 2020, however these tokens will not be added to the publicly traded supply unless they are granted",
      "- Dapper Labs holds 250M FLOW without transfer restrictions",
      "- Ecosystem Reserve of 400.2M FLOW for ecosystem development",
      "Staking rewards are modeled without taking transaction fees into account, in the real world the emission will be lower because it will first use transaction fees to pay for the staking rewards, and then the rest will be minted",
    ],
    token: `coingecko:flow`,
    sources: [
      "https://developers.flow.com/networks/staking/schedule",
      "https://flow.com/post/flow-token-circulating-supply-updates",
      "https://blog.coinlist.co/flow-raises-18m-on-coinlist/"
    ],
    protocolIds: ["6104"]
  },
  categories: {
    farming: ["Staking Rewards"],
    insiders: ["Development Team", "Dapper Labs", "Pre-launch Backers"],
    publicSale: ["Community Sale", "Auction"],
    noncirculating: ["Ecosystem Reserve"]
  }
};

export default flow;
