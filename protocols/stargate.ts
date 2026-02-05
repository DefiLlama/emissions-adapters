import { CliffAdapterResult, Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds, readableToSeconds } from "../utils/time";
import { balance, latest } from "../adapters/balance";
import { queryCustom } from "../utils/queries";

const qty = 1000000000;
const start = 1647504000;
const timestampDeployed = 1648252800;
const token = "0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6";

const STG_ADDRESSES = [
  '0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6',
  '0x6694340fc020c5e6b96567843da2df01b2ce1eb6',
  '0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590',
  '0xb0d502e938ed5f4df2e681fe6e419ff29631d62b',
  '0x296f55f8fb28e498b858d0bcda06d955b2cb3f97'
];

const rewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const addrList = STG_ADDRESSES.map(a => `'${a}'`).join(',\n    ');
  const shortAddrList = STG_ADDRESSES.map(a => `'${a.slice(0, 10)}'`).join(', ');
  const data = await queryCustom(`
    SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE chain in ('1', '10', '56', '137', '42161') AND short_address IN (${shortAddrList}) AND short_topic0 = '0xddf252ad'
WHERE topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
AND address IN (${addrList})
and topic1 IN (
    '0x000000000000000000000000b0d502e938ed5f4df2e681fe6e419ff29631d62b',
    '0x0000000000000000000000008731d54e9d02c286767d56ac03e8037c07e01e98',
    '0x0000000000000000000000004dea9e918c6289a52cd469cac652727b7b412cd2',
    '0x0000000000000000000000003052a0f6ab15b4ae1df39962d5ddefaca86dab47',
    '0x000000000000000000000000ea8dfee1898a7e0a59f7527f076106d7e44c2176'
)
GROUP BY date
ORDER BY date DESC;
  `, {});

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount),
    });
  }
  return result;
};

const stargate: Protocol = {
  "core contributors": manualLinear(
    start + periodToSeconds.year,
    start + 3 * periodToSeconds.year,
    0.175 * qty,
  ),
  investors: manualLinear(
    start + periodToSeconds.year,
    start + 3 * periodToSeconds.year,
    0.175 * qty,
  ),
  "STG launch auction purchasers": manualLinear(
    start + periodToSeconds.year,
    start + 1.5 * periodToSeconds.year,
    0.1 * qty,
  ),
  "STG-USDC Curve pool incentives": manualCliff(start, 0.05 * qty),
  "post launch bonding curve": manualCliff(start, 0.1595 * qty),
  "initial emissions program": manualLinear(
    start,
    start + 3 * periodToSeconds.month,
    0.0211 * qty,
  ),
  "STG DEX liquidity": manualCliff(start, 0.0155 * qty),
  // "future incentives": (backfill: boolean) =>
  //   balance(
  //     ["0x65bb797c2b9830d891d87288f029ed8dacc19705"],
  //     token,
  //     "ethereum",
  //     "stargate-finance",
  //     timestampDeployed,
  //     backfill,
  //   ),
  "LP Rewards": rewards,
  meta: {
    sources: [
      "https://stargateprotocol.gitbook.io/stargate/v/user-docs/tokenomics/allocations-and-lockups",
    ],
    token: `ethereum:${token}`,
    protocolIds: ["1571"],
    // total: qty,
    // incompleteSections: [
    //   {
    //     key: "future incentives",
    //     allocation: qty * 0.3039,
    //     lastRecord: (backfill: boolean) =>
    //       latest("stargate-finance", timestampDeployed, backfill),
    //   },
    // ],
  },
  categories: {
    // farming: [
    //   "STG-USDC Curve pool incentives",
    //   "initial emissions program",
    //   "future incentives",
    // ],
    farming: ["LP Rewards"],
    publicSale: ["STG launch auction purchasers", "STG DEX liquidity"],
    privateSale: ["investors"],
    insiders: ["core contributors"],
  },
};

export default stargate;
