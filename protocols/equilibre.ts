import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from '../utils/time';

const initialSupply = 40000000;
const weeklyDecayRate = 0.01;
const startTimestamp = 1677117405;  
const oneWeekInSeconds = periodToSeconds.week;

const weeklyDecay = (supply: number, weeks: number): number => {
  for (let i = 0; i < weeks; i++) {
    supply -= supply * weeklyDecayRate;
  }
  return supply;
};

function equilibre(): Protocol {
  const weeksSinceStart = (Date.now() / 1000 - startTimestamp) / oneWeekInSeconds;

  return {
    community: manualLinear(
      startTimestamp,
      startTimestamp + weeksSinceStart * oneWeekInSeconds,
      weeklyDecay(initialSupply, weeksSinceStart),
    ),
    team: [
      manualCliff(startTimestamp, initialSupply * 0.15),
      manualLinear(
        startTimestamp + 0.5 * periodToSeconds.year,
        startTimestamp + periodToSeconds.year,
        initialSupply * 0.15,
      ),
      manualLinear(
        startTimestamp + periodToSeconds.year,
        startTimestamp + 2 * periodToSeconds.year,
        initialSupply * 0.15,
      ),
    ],
    grants: manualCliff(startTimestamp, initialSupply * 0.4),
    airdrop: manualCliff(startTimestamp, initialSupply * 0.0125),
    liquidity: manualCliff(startTimestamp, initialSupply * 0.0025),
    meta: {
      sources: ["https://equilibre-finance.gitbook.io/equilibre/emissions", "https://equilibre-finance.gitbook.io/equilibre/initial-distribution"],
      token: "vara:0xE1da44C0dA55B075aE8E2e4b6986AdC76Ac77d73", 
      protocolIds: ["566"],  
    },
    sections: {
      farming: ["community", "liquidity"],
      airdrop: ["airdrop"],
      noncirculating: ["grants"],
      insiders: ["team"],
    },
  };
}

export default equilibre;
