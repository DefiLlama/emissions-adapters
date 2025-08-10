import { balance, latest } from "../adapters/balance";
import { manualCliff } from "../adapters/manual";
import { CliffAdapterResult, Protocol, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const start = 1669680000;
const qty = 1e9;

const liquidityRewards = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
     SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3, 64))))) / 1e18 AS amount
  FROM evm_indexer.logs
  WHERE address in ('0x9040e41ef5e8b281535a96d9a48acb8cfabd9a48')
    AND topic0 = '0x72d2511ac7dd6d1171d9b798c2662417660eb70235ed1b47dfe9a015929cdf40'
    AND timestamp >= toDateTime('2022-11-15')
  GROUP BY date
  ORDER BY date DESC
  `, {});

  const result: CliffAdapterResult[] = [];
  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount),
      isUnlock: false,
    });
  }
  return result;
};

const referralRewards = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 131, 64))))) / 1e18 AS amount
  FROM evm_indexer.logs
  WHERE address in ('0xe50b2ceac4f60e840ae513924033e753e2366487')
    AND topic0 = '0x18bdb6adb84039f917775d1fb8e7b7e7737ad5915d12eef0e4654b85e18d07b4'
    AND timestamp >= toDateTime('2022-11-15')
  GROUP BY date
  ORDER BY date DESC
  `, {});

  const result: CliffAdapterResult[] = [];
  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount),
      isUnlock: false,
    });
  }
  return result;
};

const incentives: SectionV2 = {
  methodology: "Incentives are distributed through the referral program and liquidity mining. We used event logs to calculate the total amount distributed.",
  isIncentive: true,
  components: [{
    id: "referral-rewards",
    name: "Referral Rewards",
    fetch: referralRewards,
  },
    {
      id: "liquidity-rewards",
      name: "Liquidity Rewards",
      fetch: liquidityRewards,
    },
  ]
}

const across: Protocol = {
  Airdrop: manualCliff(start, qty * 0.125),
  "Strategic Partnerships": [
    manualCliff("2025-06-30", qty * 0.1),
    (backfill: boolean) =>
      balance(
        ["0x8180D59b7175d4064bDFA8138A58e9baBFFdA44a"],
        "0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F",
        "ethereum",
        "across",
        1669939200,
        backfill
      ),
  ],
  "DAO Treasury": (backfill: boolean) =>
    balance(
      ["0xB524735356985D2f267FA010D681f061DfF03715"],
      "0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F",
      "ethereum",
      "across",
      1669642200,
      backfill
    ),
  // "Protocol Rewards": (backfill: boolean) =>
  //   balance(
  //     ["0x9040e41eF5E8b281535a96D9a48aCb8cfaBD9a48"],
  //     "0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F",
  //     "ethereum",
  //     "across",
  //     1669642200,
  //     backfill
  //   ),
  "Incentives": incentives,
  meta: {
    notes: [
      `We have inferred the Protocol Rewards contract addresses from token balances.`,
    ],
    token: "ethereum:0x44108f0223a3c3028f5fe7aec7f9bb2e66bef82f",
    sources: [
      `https://medium.com/across-protocol/happy-birthday-across-to-we-got-you-something-11dbef976d6a`,
    ],
    version: 2,
    protocolIds: ["1207"],
    total: qty,
    incompleteSections: [
      {
        lastRecord: (backfill: boolean) => latest("across", 1669642200, backfill),
        key: "DAO Treasury",
        allocation: qty * 0.525,
      },
      // {
      //   lastRecord: (backfill: boolean) => latest("across", 1669642200, backfill),
      //   key: "Protocol Rewards",
      //   allocation: qty * 0.1,
      // },
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
    farming: ["Referral Rewards", "Liquidity Rewards"],
    privateSale: ["Strategic Partnerships"],
  },
};

export default across;
