import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1681945200;
const qty = 100000000;
const token = "0x67d85a291fcdc862a78812a3c26d55e28ffb2701";
const chain = "ethereum";

const vesting = (portion: number) => [
  manualCliff(start + periodToSeconds.year, qty * portion * 0.25),
  manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 4,
    qty * portion * 0.75,
  ),
];

const asymetrix: Protocol = {
  Investors: vesting(0.25),
  Team: vesting(0.25),
  Community: [manualCliff(start, qty * 0.1), vesting(0.4)],
  meta: {
    token: `${chain}:${token}`,
    sources: [
      "https://docs.asymetrix.io/governance-token/asx-token-distribution",
    ],
    protocolIds: ["2885"],
  },
  categories: {
    farming: ["Community"],
    insiders: ["Team", "Investors"],
  },
};

export default asymetrix;
