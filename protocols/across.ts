import { balance, latest } from "../adapters/balance";
import { manualCliff } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const start = 1669680000;
const qty = 1e9;

const across: Protocol = {
  Airdrop: manualCliff(start, qty * 0.125),
  "Strategic Partnerships": [
    manualCliff("2025-06-30", qty * 0.1),
    () =>
      balance(
        ["0x8180D59b7175d4064bDFA8138A58e9baBFFdA44a"],
        "0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F",
        "ethereum",
        "across",
        1669939200,
      ),
  ],
  "DAO Treasury": () =>
    balance(
      ["0xB524735356985D2f267FA010D681f061DfF03715"],
      "0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F",
      "ethereum",
      "across",
      1669642200,
    ),
  "Protocol Rewards": () =>
    balance(
      ["0x9040e41eF5E8b281535a96D9a48aCb8cfaBD9a48"],
      "0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F",
      "ethereum",
      "across",
      1669642200,
    ),
  meta: {
    notes: [
      `We have inferred the Protocol Rewards contract addresses from token balances.`,
    ],
    token: "ethereum:0x44108f0223a3c3028f5fe7aec7f9bb2e66bef82f",
    sources: [
      `https://medium.com/across-protocol/happy-birthday-across-to-we-got-you-something-11dbef976d6a`,
    ],
    protocolIds: ["1207"],
    total: qty,
    incompleteSections: [
      {
        lastRecord: (backfill: boolean) => latest("across", 1669642200, backfill),
        key: "DAO Treasury",
        allocation: qty * 0.525,
      },
      {
        lastRecord: (backfill: boolean) => latest("across", 1669642200, backfill),
        key: "Protocol Rewards",
        allocation: qty * 0.1,
      },
      {
        lastRecord: (backfill: boolean) => latest("across", 1669939200, backfill),
        key: "Strategic Partnerships",
        allocation: qty * 0.25,
      },
    ],
  },
  categories: {
    airdrop: ["Airdrop"],
    noncirculating: ["DAO Treasury"],
    farming: ["Protocol Rewards"],
    privateSale: ["Strategic Partnerships"],
  },
};

export default across;
