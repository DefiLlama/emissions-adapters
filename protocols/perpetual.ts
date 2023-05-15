import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";
// import { daoSchedule, latestDao } from "../adapters/balance";

const start: number = 1599260400;
const v1Launch: number = 1607990400;
const mainnetLaunch: number = 1623711600;
const qty: number = 150000000;
const timestampDeployed: number = 1612828800;
const token: string = "0xbc396689893d065f41bc2c6ecbee5e0085233447";
const perpetual: Protocol = {
  // "Ecosystem and rewards": daoSchedule(
  //   21000000,
  //   ["0xd374225abb84dca94e121f0b8a06b93e39ad7a99"],
  //   token,
  //   "ethereum",
  //   "perpetual",
  //   timestampDeployed,
  // ),
  "Seed investors": manualStep(
    v1Launch,
    periodToSeconds.year / 4,
    4,
    qty * 0.042 / 4,
  ),
  "Balancer LBP": manualCliff(start, qty * 0.05),
  "Strategic investors": manualStep(
    v1Launch,
    periodToSeconds.year / 4,
    4,
    qty * 0.15 / 4,
  ),
  "Team and advisors": manualStep(
    mainnetLaunch + periodToSeconds.month * 6,
    periodToSeconds.year / 4,
    48,
    656250,
  ),
  meta: {
    notes: [
      `Seed and strategic investors received either 1/4 or 1/5 of their tokens each quarter. Here we have assumed 1/4 for all.`,
      `The DAO was allocated 54.8%, with no set emissions schedule, therefore this has been excluded from the analysis.`,
    ],
    sources: [
      "https://support.perp.com/hc/en-us/articles/5748445892761-PERP-Token#heading-1",
    ],
    token: `ethereum:${token}`,
    protocolIds: ["362"],
    // custom: {
    //   latestTimestamp: latestDao("perpetual", timestampDeployed),
    // },
  },
  sections: {
    farming: ["Balancer LBP", "Ecosystem and rewards"],
    insiders: ["Seed investors", "Strategic investors", "Team and advisors"],
    unconfirmed: ["Ecosystem and rewards"],
  },
};
export default perpetual;
