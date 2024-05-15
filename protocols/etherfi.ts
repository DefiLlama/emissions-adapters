import { balance, latest } from "../adapters/balance";
import { manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1709679600;
const total = 1e9;
const token = "0xfe0c30065b384f05761f15d0cc899d4f9f9cc0eb";
const chain = "ethereum";

const etherfi: Protocol = {
  "Core Contributors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.2326,
  ),
  Treasury: () =>
    balance(
      ["0x6329004E903B7F420245E7aF3f355186f2432466"],
      token,
      chain,
      "etherfi",
      1714694400,
    ),
  // "User Airdrops": () => balance(),
  // Partnerships: () => balance(),
  Investors: manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(2),
    total * 0.325,
  ),
  meta: {
    token: `${chain}:${token}`,
    notes: [
      `Details of the User Airdrops and Partnerships sections wallet addresses and schedules couldn't be found so they've been excluded in this analysis.`,
    ],
    sources: [
      `https://etherfi.medium.com/announcing-ethfi-the-ether-fi-governance-token-8cae7327763a`,
    ],
    protocolIds: ["4133"],
    incompleteSections: [
      {
        allocation: total * 0.2724,
        key: "Treasury",
        lastRecord: () => latest("etherfi", 1714694400),
      },
    ],
    // incompleteSections: [
    // {
    //   allocation: total * 0.15,
    //   key: "Foundation",
    //   lastRecord: () => latest("ethena", 0),
    // },
    // {
    //   allocation: total * 0.3,
    //   key: "Ecosystem Development",
    //   lastRecord: () => latest("ethena", 0),
    // },
    // ],
  },
  categories: {
    insiders: ["Investors", "Core Contributors"],
    noncirculating: ["Foundation", "Ecosystem Development", "Treasury"],
  },
};

export default etherfi;
