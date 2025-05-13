import { supply, latest } from "../adapters/supply";
import { Protocol } from "../types/adapters";

const start = 1565395200;
const token = "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F";
const chain = "ethereum";

const synthetix: Protocol = {
  Miscellaneous: (backfill: boolean) =>
    supply(chain, token, start, "synthetix", 0, backfill),
  meta: {
    token: `${chain}:${token}`,
    sources: [
      "https://www.binance.com/en/research/projects/synthetix",
      "https://docs.synthetix.io/synthetix-protocol/the-synthetix-protocol/synthetix-token-snx",
    ],
    notes: [
      `There have been many changes to SNX tokenomicsa and it is difficult to describe the token allocations and vesting schedules.`,
    ],
    protocolIds: ["115"],
    incompleteSections: [
      {
        key: "Miscellaneous",
        lastRecord: (backfill: boolean) => latest("synthetix", start, backfill),
        allocation: undefined,
      },
    ],
  },
  categories: {},
};

export default synthetix;
