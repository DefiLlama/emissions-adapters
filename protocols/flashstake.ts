import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 150000000;
const start = 1659308400;

const flashstake: Protocol = {
  "Community airdrop": manualCliff(start, qty * 0.1866),
  "Team budget": [
    manualCliff(start, qty * 0.0525),
    manualLinear(start, start + periodToSeconds.year, qty * 0.075),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.year * 2,
      qty * 0.0225,
    ),
  ],
  "Growth budget": manualCliff(start, qty * 0.3884),
  "Staking budget": manualLinear(
    start,
    start + periodToSeconds.year,
    qty * 0.1234,
  ),
  "Blockzero treasury": [
    manualCliff(start, qty * 0.0303),
    manualLinear(start, start + periodToSeconds.year, qty * 0.1214),
  ],
  meta: {
    sources: ["https://docs.flashstake.io/tokenomics-flash/token-distribution"],
    token: "ethereum:0xb1f1f47061a7be15c69f378cb3f69423bd58f2f8",
    protocolIds: ["2115"],
  },
  sections: {
    airdrop: ["Community airdrop"],
    insiders: ["Team budget"],
    noncirculating: ["Blockzero treasury", "Staking budget", "Growth budget"],
  },
};

export default flashstake;
