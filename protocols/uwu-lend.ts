import { balance, latest } from "../adapters/balance";
import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1662336000;
const token = "0x55c08ca52497e2f1534b59e2917bf524d4765257";
const chain = "ethereum";

const uwulend: Protocol = {
  Investors: [
    manualCliff(start + periodToSeconds.months(6), 1e6),
    manualLinear(
      start + periodToSeconds.months(6),
      start + periodToSeconds.years(2),
      3e6,
    ),
  ],
  // Treasury: () =>
  //   balance(
  //     ["0xC671A6B1415dE6549B05775Ee4156074731190c6"],
  //     token,
  //     chain,
  //     "uwu-lend",
  //     start,
  //   ),
  // documented: {
  // replaces: ["Treasury"],
  Team: manualLinear(start, start + periodToSeconds.years(2), 4e6),
  Treasury: manualLinear(start, start + periodToSeconds.years(4), 8e6),
  // },
  meta: {
    token: `coingecko:uwu-lend`,
    sources: [`https://docs.uwulend.fi/tokenomics`],
    protocolIds: ["2111"],
    // incompleteSections: [
    //   {
    //     lastRecord: () => latest("uwu-lend", start),
    //     key: "Treasury",
    //     allocation: undefined,
    //   },
    // ],
  },
  categories: {
    insiders: ["Team", "Investors"],
    farming: ["Treasury"],
  },
};

export default uwulend;
