import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1710284400;
const total = 1e9;
const token = "0xfe0c30065b384f05761f15d0cc899d4f9f9cc0eb";
const chain = "ethereum";

const etherfi: Protocol = {
  "Core Contributors": [
    manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(2),
    total * 0.160987500
  ),
    manualLinear(
    start + periodToSeconds.years(2),
    start + periodToSeconds.years(3),
    total * 0.0536625
  ),
],
  Treasury: manualCliff(start, total * 0.21629),
  "Community": [
    manualCliff(start, total * 0.095),
    manualCliff(1720483200, total * 0.058),
    manualCliff(1726531200, total * 0.027),
    manualCliff(1738627200, total * 0.01265),
  ],
  Partnerships: manualCliff(start, total * 0.039),
  Investors: manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.years(2),
    total * 0.33738,
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
    noncirculating: ["Foundation","Ecosystem Development","Treasury"],
    privateSale: ["Investors"],
    insiders: ["Core Contributors"],
  },
};

export default etherfi;
