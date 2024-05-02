import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { balance, latest } from "../adapters/balance";

const total = 65e4;
const start = 1654128000; // 2 June 2022
const token = "0xc55126051b22ebb829d00368f4b12bde432de5da";
const chain = "ethereum";

const schedule = (portion: number) => [
  manualStep(start, periodToSeconds.months(3), 4, (total * portion * 0.15) / 4),
  manualStep(
    start + periodToSeconds.year,
    periodToSeconds.months(3),
    4,
    (total * portion * 0.35) / 4,
  ),
  manualStep(
    start + periodToSeconds.years(2),
    periodToSeconds.months(3),
    4,
    (total * portion * 0.5) / 4,
  ),
];

const btrfly: Protocol = {
  "V1 Supply": manualCliff(start, total * 0.224),
  Seed: schedule(0.06),
  "Founding Team": schedule(0.09),
  "DAO Reserves": () =>
    balance(
      ["0xA52Fd396891E7A74b641a2Cb1A6999Fcf56B077e"],
      token,
      chain,
      "btrfly",
      1659974400,
    ),
  Olympus: [
    manualLinear(start, start + periodToSeconds.year, 4875),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(2),
      16250,
    ),
    manualLinear(
      start + periodToSeconds.years(2),
      start + periodToSeconds.years(3),
      27625,
    ),
    manualLinear(
      start + periodToSeconds.years(3),
      start + periodToSeconds.years(4),
      16250,
    ),
  ],
  Pulse: [
    manualLinear(start, start + periodToSeconds.year, 94681),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(2),
      55385,
    ),
    manualLinear(
      start + periodToSeconds.years(2),
      start + periodToSeconds.years(3),
      39296,
    ),
    manualLinear(
      start + periodToSeconds.years(3),
      start + periodToSeconds.years(4),
      30480,
    ),
    manualLinear(
      start + periodToSeconds.years(2),
      start + periodToSeconds.years(3),
      5648,
    ),
    manualLinear(
      start + periodToSeconds.years(3),
      start + periodToSeconds.years(4),
      4776,
    ),
  ],
  meta: {
    notes: [
      "The remaining BTRFLY will be released under Pulse after year June 2026.",
    ],
    sources: ["https://docs.redacted.finance/btrfly/tokenomics"],
    token: `${chain}:${token}`,
    protocolIds: ["1056", "2092", "3226"],
    incompleteSections: [
      {
        key: "DAO Reserves",
        allocation: total * 0.15,
        lastRecord: () => latest("btrfly", 1659974400),
      },
    ],
    total,
  },
  categories: {
    insiders: ["Seed", "Founding Team"],
    farming: ["Olympus", "V1 Supply"],
    noncirculating: ["Pulse", "DAO Reserves"],
  },
};

export default btrfly;
