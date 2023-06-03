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

function equilibre(): Protocol { 
  const weeksSinceStart = (Date.now() / 1000 - startTimestamp) / oneWeekInSeconds; 

  return { 
    community: manualLinear( 
      startTimestamp, 
      startTimestamp + weeksSinceStart * oneWeekInSeconds, 
      weeklyDecay(initialSupply * 0.1, weeksSinceStart),  // 10% for community fund
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
    partnerProtocols: manualCliff(startTimestamp, initialSupply * 0.3375),  // 33.75% for partner protocols
    grants: manualCliff(startTimestamp, initialSupply * 0.4),  // 40% for grants
    airdrop: manualCliff(startTimestamp, initialSupply * 0.01),  // 1% for testnet airdrop
    liquidity: manualCliff(startTimestamp, initialSupply * 0.0025),  // 0.25% for liquidity
    meta: { 
      sources: [
        "https://equilibre-finance.gitbook.io/equilibre-v1/protocol-overview/tokenomics/emissions", 
        "https://equilibre-finance.gitbook.io/equilibre-v1/protocol-overview/tokenomics/initial-distribution"
      ], 
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

export default equilibre();
