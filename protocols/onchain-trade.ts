import { manualCliff, manualLinear, manualLog } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1680091200;
const qty = 100_000_000;
const end = 1837944000 ;
const start_team = 1688040000



const OT: Protocol = {
    "IFO": manualCliff(start, qty * 0.1),
    "Community Incentive":manualLinear(start, end + periodToSeconds.year * 5 , qty * 45_000_000),
    "Team":manualLinear(start_team, end + periodToSeconds.month * 24 , qty * 20_000_000),
    "Partnerships & Marketing":manualLinear(start, end + periodToSeconds.year * 5, qty * 5_000_000),
    "Initial Liquidity": manualCliff(start, qty * 0.025),
    "Treasury": manualCliff(start, qty * 0.175),
  notes: [
    `Treasury can be sold at anytime`,
    'Team Locked for the first 3 months. Than linear in the next 24 months',
  ],
  token: "0xD0eA21ba66B67bE636De1EC4bd9696EB8C61e9AA",
  sources: ["https://onchaintrade.gitbook.io/ot/tokenomics/tokenomics-zksync-era"],
  protocolIds: ["2752"],
};

export default OT;