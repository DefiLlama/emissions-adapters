import { balance, latest } from "../adapters/balance";
import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1670198400;
const qty = 1e6;
const GRAIL = "0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8";
const chain = "arbitrum";

const camelot: Protocol = {
  Advisors: manualLinear(start, start + periodToSeconds.year * 3, qty * 0.02),
  "Development Fund": manualLinear(
    start,
    start + periodToSeconds.year * 3,
    qty * 0.025,
  ),
  Ecosystem: () =>
    balance(
      ["0x03fF2d78AFB69e0859Ec6bEB4CF107D3741e97AB"],
      GRAIL,
      chain,
      "camelot",
      1669852800,
    ),
  "Genesis Pool": manualLinear(
    start,
    start + periodToSeconds.month * 6,
    qty * 0.05,
  ),
  Reserves: () =>
    balance(
      ["0x48E365dAEBe55aa21Bb39E4c2876661827d566c5"],
      GRAIL,
      chain,
      "camelot",
      1669852800,
    ),
  Partnerships: [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.025),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.year * 2,
      qty * 0.1,
    ),
  ],
  "Protocol Owned Liquidity": manualCliff(start, qty * 0.1),
  "Public Sale": manualCliff(start, qty * 0.15),
  "Liquidity Mining": manualLinear(
    start,
    start + periodToSeconds.year * 3,
    qty * 0.225,
  ),
  "Core Contributors": manualLinear(
    start,
    start + periodToSeconds.year * 3,
    qty * 0.2,
  ),
  meta: {
    notes: [
      `A considerable amount of GRAIL supply is allocated as xGRAIL. Since the vesting duration and conversion rate are unpredictable, we have simplified this analysis by counting xGRAIL as GRAIL.`,
    ],
    token: `${chain}:${GRAIL}`,
    sources: [`https://docs.camelot.exchange/tokenomics/token-distribution`],
    protocolIds: ["2307", "2792"],
    incompleteSections: [
      {
        key: "Ecosystem",
        allocation: qty * 0.05,
        lastRecord: () => latest("camelot", 1669852800),
      },
      {
        key: "Reserves",
        allocation: qty * 0.08,
        lastRecord: () => latest("camelot", 1669852800),
      },
    ],
  },
  categories: {
    insiders: ["Advisors", "Partnerships", "Core Contributors"],
    noncirculating: [
      "Development Fund",
      "Ecosystem",
      "Reserves",
      "Protocol Owned Liquidity",
    ],
    publicSale: ["Genesis Pool", "Public Sale"],
    farming: ["Liquidity Mining"],
  },
};

export default camelot;
