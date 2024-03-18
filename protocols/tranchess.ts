import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { normalizeTime, periodToSeconds } from "../utils/time";
import { balance, latest } from "../adapters/balance";

const qty = 3e8;
const start = 1624489200;

const decreasing = (
  start: string,
  end: string,
  decrease: number,
  initial: number,
) => {
  const sections = [];
  let workingTime = normalizeTime(start, undefined);
  let amount = initial;
  const unixEnd = normalizeTime(end, undefined);
  while (workingTime < unixEnd) {
    sections.push(
      manualLinear(workingTime, workingTime + periodToSeconds.week, amount),
    );
    workingTime += periodToSeconds.week;
    amount *= 1 - decrease;
  }
  return sections;
};
const tranchess: Protocol = {
  Team: [
    manualCliff(start + periodToSeconds.week * 13, qty * 0.2 * 0.1),
    manualStep(
      start + periodToSeconds.week * 13,
      periodToSeconds.week,
      170,
      (qty * 0.2 * 0.9) / 170,
    ),
  ],
  "Seed Investors": [
    manualCliff(start + periodToSeconds.week * 13, qty * 0.05 * 0.1),
    manualStep(
      start + periodToSeconds.week * 13,
      periodToSeconds.week,
      104,
      (qty * 0.05 * 0.9) / 104,
    ),
  ],
  //   "Future Investors": [],
  "Community Incentives": [
    manualLinear("2021-06-24", "2021-07-01", 3e5),
    manualLinear("2021-07-01", "2021-07-08", 6e5),
    manualLinear("2021-07-08", "2021-07-15", 9e5),
    manualLinear("2021-07-15", "2021-07-22", 12e5),
    manualLinear("2021-07-22", "2021-07-29", 24e5),
    decreasing("2021-07-29", "2021-11-11", 0.04, 2304000),
    decreasing("2021-11-11", "2022-03-31", 0.03, 1261977),
    decreasing("2022-03-31", "2022-06-09", 0.02, 693331),
    decreasing("2022-06-09", "2022-10-27", 0.02, 566502),
    decreasing("2022-10-27", "2023-01-05", 0.01, 382060),
    manualLinear("2023-01-05", "2023-10-12", 349019 * 40),

    manualLinear("2022-01-13", "2022-01-20", 10e5),
    manualLinear("2022-01-20", "2022-01-27", 8e5),
    manualLinear("2022-01-27", "2022-02-03", 6e5),
    manualLinear("2022-02-03", "2022-02-10", 4e5),
    manualLinear("2022-02-10", "2022-02-17", 2e5),
  ],
  "Ecosystem / Treasury": [
    () =>
      balance(
        ["0x1bf019A44a708FBEBA7ADc79bdaD3D0769fF3a7b"],
        "0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6",
        "bsc",
        "tranchess",
        1629154800,
      ),
    () =>
      balance(
        ["0x1bf019A44a708FBEBA7ADc79bdaD3D0769fF3a7b"],
        "0xD6123271F980D966B00cA4FCa6C2c021f05e2E73",
        "ethereum",
        "tranchess",
        1671062400,
      ),
  ],
  meta: {
    sources: [
      "https://docs.tranchess.com/faq/chess#how-long-is-the-vesting-schedule",
      "https://discord.com/channels/778640211399671818/841178823453310996/1007538773191573514",
    ],
    token: "bsc:0x20de22029ab63cf9a7cf5feb2b737ca1ee4c82a6",
    protocolIds: ["425", "3048"],
    total: qty,
    incompleteSections: [
      {
        key: "Ecosystem / Treasury",
        allocation: qty * 0.5,
        lastRecord: () => latest("tranchess", 1629154800),
      },
    ],
  },
  categories: {
    insiders: ["Team", "Seed Investors"],
    farming: ["Community Incentives"],
    noncirculating: ["Ecosystem / Treasury"],
  },
};

export default tranchess;
