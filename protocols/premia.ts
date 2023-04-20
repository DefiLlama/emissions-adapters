import { manualCliff, manualLinear, manualLog } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const qty = 100000000;
const startvestings = 1672531200;

const premia: Protocol = {
  "Bootstrap Distribution": manualCliff(startvestings, qty * 0.1),
  "Strategic Partnerships": manualCliff(startvestings, qty * 0.2),
  "Premian Republic - Operator": manualCliff(startvestings, qty * 0.4),
  "Community Incentive": manualLinear(
    startvestings,
    startvestings + periodToSeconds.month * 128,
    30000000,
  ),
  meta: {
    notes: [
      `Team locked tokens for 4 more years`,
      "Jan 2023 is when premia team reposted vesting schedule, but tokens were vesting since feb 2021",
    ],
    token: "ethereum:0x6399C842dD2bE3dE30BF99Bc7D1bBF6Fa3650E70",
    sources: [
      "https://docs.premia.finance/metaeconomy/meta-economic-essentials/premia-tokenomics",
    ],
    protocolIds: ["381"],
  },
  sections: {
    insiders: ["Strategic Partnerships"],
    farming: ["Bootstrap Distribution", "Community Incentive"],
    noncirculating: ["Premian Republic - Operator"],
  },
};

export default premia;
