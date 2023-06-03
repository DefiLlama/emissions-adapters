import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from '../utils/time';
import incentives from "../adapters/curve/community";


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

// Main function to define the Equilibre protocol
function equilibre(): Protocol {
  // Calculate the weeks since the start of the protocol
  const weeksSinceStart = (Date.now() / 1000 - startTimestamp) / oneWeekInSeconds;

  // Fetch incentives for the Equilibre community
  const equilibreCommunity = async ()=>incentives(
    "0xE1da44C0dA55B075aE8E2e4b6986AdC76Ac77d73",
    startTimestamp,
    initialSupply,
    weeklyDecayRate,
    periodToSeconds.week,
  );

  // Return the protocol data
  return {
    // Define community with linear emission schedule
    community: manualLinear(
      startTimestamp,
      startTimestamp + weeksSinceStart * oneWeekInSeconds,
      weeklyDecay(initialSupply, weeksSinceStart),
    ),
    // Define team with cliff and linear emission schedules
    team: [
      manualCliff(startTimestamp, initialSupply * 0.15),  // 15% allocation for team
      manualLinear(
        startTimestamp + 0.5 * periodToSeconds.year,
        startTimestamp + periodToSeconds.year,
        initialSupply * 0.15,
      ),  // Additional 15% allocation for team, linearly distributed over half a year
      manualLinear(
        startTimestamp + periodToSeconds.year,
        startTimestamp + 2 * periodToSeconds.year,
        initialSupply * 0.15,
      ),  // Additional 15% allocation for team, linearly distributed over a year
    ],
    // Define grants with cliff emission schedule
    grants: manualCliff(startTimestamp, initialSupply * 0.4),  // 40% allocation for grants
    // Define airdrop with cliff emission schedule
    airdrop: manualCliff(startTimestamp, initialSupply * 0.0125),  // 1.25% allocation for airdrop
    // Define liquidity with cliff emission schedule
    liquidity: manualCliff(startTimestamp, initialSupply * 0.0025),  // 0.25% allocation for liquidity
    // Define the method for continuing emissions
    "continuing emissions": equilibreCommunity,
    // Define meta information
    meta: {
      sources: ["https://equilibre-finance.gitbook.io/equilibre-v1/protocol-overview/tokenomics/emissions", "https://equilibre-finance.gitbook.io/equilibre-v1/protocol-overview/tokenomics/initial-distribution"],
      token: "vara:0xE1da44C0dA55B075aE8E2e4b6986AdC76Ac77d73", 
      protocolIds: ["566"],  
    },
    // Define the sections for the protocol
    sections: {
      farming: ["community", "liquidity"],
      airdrop: ["airdrop"],
      noncirculating: ["grants"],
      insiders: ["team"],
    },
  };
}

// Export the equilibre function as the default export
export default equilibre;

