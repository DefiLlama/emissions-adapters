import { manualCliff, manualLinear } from "../adapters/manual";
import adapter from "../adapters/uniswap/uniswap";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

// some missing from uni somewhere
const start = 1600106400;

const merklRewards = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE topic0 = '0xf7a40077ff7a04c7e61f6f26fb13774259ddf1b6bce9ecf26a8276cdd3992683'
AND address IN (
    '0x3ef3d8ba38ebe18db133cec108f4d14ce00dd9ae'
)
WHERE topic2 IN (
    '0x0000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0x0000000000000000000000008f187aa05619a017077f5308904739877ce9ea21',
    '0x000000000000000000000000fa7f8980b0f1e64a2062791cc3b0871572f1f7f0',
    '0x0000000000000000000000006fd9d7ad17242c41f7131d257212c54a0e816691',
    '0x000000000000000000000000c3de830ea07524a0761646a6a4e4be0e114a3c83'
)
GROUP BY date
ORDER BY date DESC;

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

function uniswap(): Protocol {
  const community = async () =>
    Promise.all(
      [
        "0x4750c43867EF5F89869132ecCF19B9b6C4286E1a",
        "0xe3953D9d317B834592aB58AB2c7A6aD22b54075D",
        "0x4b4e140d1f131fdad6fb59c13af796fd194e4135",
        "0x3d30b1ab88d487b0f3061f40de76845bec3f1e94",
      ].map((a: string) => adapter(a, "ethereum", "uni")),
    );
  return {
    community,
    incentives: merklRewards,
    airdrop: manualCliff(start, 150000000),
    "LP staking": manualLinear(
      start,
      start + periodToSeconds.month * 2,
      20000000,
    ),
    team: manualLinear(start, start + periodToSeconds.year * 4, 212660000),
    investors: manualLinear(start, start + periodToSeconds.year * 4, 180440000),
    advisors: manualLinear(start, start + periodToSeconds.year * 4, 6900000),
    meta: {
      sources: ["https://uniswap.org/blog/uni"],
      token: "ethereum:0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      protocolIds: ["2196", "2197", "2198"],
      notes: ["We track incentives when user claimed their rewards"]
    },
    categories: {
    farming: ["community", "incentives"],
    airdrop: ["airdrop"],
    privateSale: ["investors"],
    insiders: ["team","advisors"],
  },
  };
}
export default uniswap();
