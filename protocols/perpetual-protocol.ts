import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";
import { balance, latest } from "../adapters/balance";

const start: number = 1599260400;
const v1Launch: number = 1607990400;
const mainnetLaunch: number = 1623711600;
const qty: number = 150000000;
const timestampDeployed: number = 1612828800;
const token: string = "0xbc396689893d065f41bc2c6ecbee5e0085233447";

const perpetual: Protocol = {
  "Ecosystem and rewards": () =>
    balance(
      ["0xd374225abb84dca94e121f0b8a06b93e39ad7a99"],
      token,
      "ethereum",
      "perpetual-protocol",
      timestampDeployed,
    ),
  "Seed investors": manualStep(
    v1Launch,
    periodToSeconds.year / 4,
    4,
    (qty * 0.042) / 4,
  ),
  "Balancer LBP": manualCliff(start, qty * 0.05),
  "Strategic investors": manualStep(
    v1Launch,
    periodToSeconds.year / 4,
    4,
    (qty * 0.15) / 4,
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
    ],
    sources: [
      "https://support.perp.com/hc/en-us/articles/5748445892761-PERP-Token#heading-1",
    ],
    token: `ethereum:${token}`,
    protocolIds: ["362"],
    incompleteSections: [
      {
        key: "Ecosystem and rewards",
        allocation: qty * 0.548,
        lastRecord: () => latest("perpetual-protocol", timestampDeployed),
      },
    ],
  },
  categories: {
    farming: ["Balancer LBP", "Ecosystem and rewards"],
    insiders: ["Seed investors", "Strategic investors", "Team and advisors"],
  },
};
export default perpetual;
