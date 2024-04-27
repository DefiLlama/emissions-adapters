import { manualCliff, manualLinear, manualStep, manualLog } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1713700739;

const saltyio: Protocol = 
  {
  "Emissions": manualLog(start, start + periodToSeconds.year * 10, 51000000, periodToSeconds.week, .50),
  "DAO Reserve": manualLinear(start, start + periodToSeconds.year * 10, 25000000),
  "Initial Dev Team": manualLinear(start, start + periodToSeconds.year * 10, 10000000),
  "Liquidity Bootstrapping": manualLog(start, start + periodToSeconds.year * 10, 5000000, periodToSeconds.day, .75),
  "Staking Bootstrapping": manualLog(start, start + periodToSeconds.year * 10, 3000000, periodToSeconds.day, .75),
  "Airdrop 1": manualLinear(start, start + periodToSeconds.week * 52, 3000000),
  "Airdrop 2": manualLinear(start + periodToSeconds.day * 45, start + periodToSeconds.day * 45 + periodToSeconds.week * 52, 3000000),
  meta: 
    {
    sources: ["https://docs.salty.io/the-salt-token/distribution"],
    token: "ethereum:0x0110B0c3391584Ba24Dbf8017Bf462e9f78A6d9F",
    protocolIds: []
    },
  categories: 
    {
    farming: [ "Airdrop 1", "Airdrop 2", "Emissions"],
    noncirculating: [ "DAO Reserve" ],
    insiders: [ "Initial Dev Team" ],
    }
  };

export default saltyio;

