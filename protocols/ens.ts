import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1636329600; // 8 November 2021 00:00:00
const qty = 100000000; //100m

const ens: Protocol = {
  "Airdrop": manualCliff(start, qty * 0.25),
  "Core Contributors": manualLinear(
    start, start + 4 * periodToSeconds.year,
    0.1954 * qty,
  ),
  "Other contributors": manualLinear(
    start, start + 4 * periodToSeconds.year,
    0.0546 * qty,
  ),
  "DAO Community Treasury": [
    manualCliff(start, 5000000), // 5m tokens release at start
    manualStep(
      start,
      periodToSeconds.month,
      48,
      (45000000) / 48,
    ), // monthly steps for the next 48 months
  ],
  meta: {
    notes: [
      `Tokens for core contributors and launch advisors will have a four year lock-up and vesting schedule.`,
    ],
    token: "ethereum:0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
    sources: ["https://ens.mirror.xyz/-eaqMv7XPikvXhvjbjzzPNLS4wzcQ8vdOgi9eNXeUuY"],
    protocolIds: ["2519"],
  },
  categories: {
    insiders: ["Other contributors", "Core Contributors", "DAO Community Treasury"],
    publicSale: [],
    airdrop: ["Airdrop"]
  },
};
export default ens;