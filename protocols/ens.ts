import { balance, latest } from "../adapters/balance";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1636329600; // 8 November 2021 00:00:00
const qty = 100000000; //100m
const token = "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72";
const chain = "ethereum";
const ens: Protocol = {
  "DAO Community Treasury": () =>
    balance(
      ["0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7"],
      token,
      chain,
      "ens",
      1649113200,
    ),
  "Core Contributors": () =>
    balance(
      ["0x690F0581eCecCf8389c223170778cD9D029606F2"],
      token,
      chain,
      "ens",
      1649113200,
    ),
  Airdrop: manualCliff(start, qty * 0.25),
  "Other contributors": manualLinear(
    start,
    start + 4 * periodToSeconds.year,
    0.0546 * qty,
  ),
  documented: {
    replaces: ["DAO Community Treasury", "Core Contributors"],
    "Core Contributors": manualLinear(
      start,
      start + 4 * periodToSeconds.year,
      0.1954 * qty,
    ),
    "DAO Community Treasury": [
      manualCliff(start, 5000000), // 5m tokens release at start
      manualStep(start, periodToSeconds.month, 48, 45000000 / 48), // monthly steps for the next 48 months
    ],
  },
  meta: {
    notes: [
      `Tokens for core contributors and launch advisors will have a four year lock-up and vesting schedule.`,
    ],
    token: `${chain}:${token}`,
    sources: [
      "https://ens.mirror.xyz/-eaqMv7XPikvXhvjbjzzPNLS4wzcQ8vdOgi9eNXeUuY",
    ],
    protocolIds: ["2519"],
    incompleteSections: [
      {
        key: "Core Contributors",
        allocation: qty * 0.1896,
        lastRecord: () => latest("ens", 1649113200),
      },
      {
        key: "DAO Community Treasury",
        allocation: qty * 0.5,
        lastRecord: () => latest("ens", 1649113200),
      },
    ],
  },
  categories: {
    insiders: [
      "Other contributors",
      "Core Contributors",
      "DAO Community Treasury",
    ],
    publicSale: [],
    airdrop: ["Airdrop"],
  },
};
export default ens;
