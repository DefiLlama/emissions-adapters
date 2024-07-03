import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1710284400;
const total = 1e9;
const token = "0xfe0c30065b384f05761f15d0cc899d4f9f9cc0eb";
const chain = "ethereum";

const etherfi: Protocol = {
  "Core Contributors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(3),
    total * 0.2326,
  ),
  Treasury: manualLinear(
    start,
    start + periodToSeconds.years(6),
    total * 0.2724,
  ),
  "User Airdrops": [
    manualCliff(start, total * 0.06),
    manualCliff(1719705600, total * 0.05),
  ],
  Partnerships: manualCliff(start, total * 0.06),
  Investors: manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(2),
    total * 0.325,
  ),
  meta: {
    token: `${chain}:${token}`,
    notes: [
      `User Airdrops and Partnerships section schedules couldn't be found so they've been inferred from the chart shown in the source material.`,
    ],
    sources: [
      `https://etherfi.medium.com/announcing-ethfi-the-ether-fi-governance-token-8cae7327763a`,
    ],
    protocolIds: ["2626", "4429"],
  },
  categories: {
    insiders: ["Investors", "Core Contributors"],
    noncirculating: ["Foundation", "Ecosystem Development", "Treasury"],
  },
};

export default etherfi;
