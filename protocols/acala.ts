import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1643112000;
const qty = 1000000000;
const start_Investors = 1675252800;
const start_Team = 1675252800;
const start_Treasury = 1643112000;

const acala: Protocol = {
  Ecosystem: manualCliff(start, qty * 0.05),
  Treasury: manualCliff(start_Treasury, qty * 0.1162),
  Team: manualLinear(
    start_Team,
    start_Team + periodToSeconds.week * 17,
    qty * 0.2525,
  ),
  Rewards: manualLinear(start, start + periodToSeconds.week * 72, qty * 0.34),
  Investors: manualLinear(
    start_Investors,
    start_Investors + periodToSeconds.week * 18,
    qty * 0.2913,
  ),
  meta: {
    notes: [
      `Investors vesting is between 12-24 months , so we will use 18 months`,
    ],
    token: "coingecko:acala",
    sources: [
      "https://github.com/AcalaNetwork/Acala-white-paper/blob/master/Acala_Token_Economy_Paper.pdf",
    ],
    protocolIds: ["2787"],
  },
  sections: {
    noncirculating: ["Treasury", "Ecosystem"],
    farming: ["Rewards"],
    insiders: ["Team", "Investors"],
  },
};

export default acala;
