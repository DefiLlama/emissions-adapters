import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";
import { daoSchedule, latestDao } from "../adapters/balance";

const start = 1642896000;
const qty = 10000000;
const timestampDeployed = 1642809600;
const token = "0x10393c20975cf177a3513071bc110f7962cd67da";

const jonesDao: Protocol = {
  "Operations & Incentives": ()=>daoSchedule(
    qty * 0.57,
    ["0xFa82f1bA00b0697227E2Ad6c668abb4C50CA0b1F"],
    token,
    "arbitrum",
    "jones-dao",
    timestampDeployed,
  ),
  "Core contributors": manualLinear(
    start,
    start + periodToSeconds.month * 18,
    qty * 0.12,
  ),
  "Public sale": manualCliff(start, qty * 0.17),
  "Private sale": [
    manualCliff(start + periodToSeconds.month * 3, qty * 0.1297 / 3),
    manualLinear(
      start + periodToSeconds.month * 3,
      start + periodToSeconds.month * 9,
      qty * 0.1297 * 2 / 3,
    ),
  ],
  Airdrop: manualCliff(start, qty * 0.01),
  //   Olympus: manualCliff(start, qty * 0.033),
  meta: {
    sources: ["https://docs.jonesdao.io/jones-dao/jones-token/tokenomics"],
    token: `arbitrum:${token}`,
    notes: [
      `Operations and Incentives allocations are emitted at a dynamic rate from a shared contract, so here they have been combined into one section of the distribution.`,
      `OlympusDAO's allocation is to be held in perpetuity (effectively burnt) so it has been excluded from our analysis.`,
    ],
    protocolIds: ["1433"],
    custom: {
      latestTimestamp: ()=>latestDao("jones-dao", timestampDeployed),
    },
  },
  sections: {
    insiders: ["Core contributors", "Private sale"],
    airdrop: ["Airdrop"],
    publicSale: ["Public sale"],
    unconfirmed: ["Operations & Incentives"],
  },
};
export default jonesDao;
