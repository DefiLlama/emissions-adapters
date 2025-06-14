import distribution from "../adapters/euler";
import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = 1640995200;
const cliff = 1640995200;

const rewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`WITH txs AS (
    SELECT transaction_hash
    FROM evm_indexer.logs
    PREWHERE chain in ('1', '10', '56', '100', '130', '137', '146', '999', '8453', '42161', '43114', '80094')
    WHERE address in (
    '0xf3e621395fc714b90da337aa9108771597b4e696',
    '0x5ee4d837ab84285924ae746eb5622bb6774692be',
    '0x5e13d41913adf18bb2acae34228e8d21f3c2f2eb',
    '0x33f3d7916615ebdeee66943ed1024d2444efd9fb',
    '0x1b0e3da51b2517e09ae74cd31b708e46b9158e8b',
    '0xbfb6318123da1682b8bd963846c1e9608f5f3cda',
    '0x09e6cab47b7199b9d3839a2c40654f246d518a80',
    '0xbcebc1cebdb9704ff4332634d5662e342685af9f',
    '0xe08e1f00d388e201e48842e53fa96195568e6813',
    '0xfa31599a4928c2d57c0dd77dfca5da1e94e6d2d2',
    '0x2e3b32730b4f6b6502bdaa9122df3b026ede5391',
    '0x56c44d2f484a61ce92fa0bcc849feb37abfeb59c'
    )
      AND topic0 = '0x5981e4d35a45c9e8c96ae51ca0f24127eaad820537621c89bbe1ba8b1712b61b'
)

SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE chain in ('1', '10', '56', '100', '130', '137', '146', '999', '8453', '42161', '43114', '80094')
WHERE topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  AND address IN (
    '0xd9fcd98c322942075a5c3860693e9f4f03aae07b',
    '0xa8a7c3468faa6750f1dc5fdafdce03cdea029304',
    '0x2117e8b79e8e176a670c9fcf945d4348556bffad',
    '0x6ca7d728949528b52f9a0aebca6d68d9874a8728',
    '0xe9c43e09c5fa733bcc2aeaa96063a4a60147aa09',
    '0x1323a02946877e0f0c1ca99468f4429cc0f0954c',
    '0x8e15c8d399e86d4fd7b427d42f06c60cdd9397e7',
    '0x24d6f84dc525ed073e2f9969d45a192c064397b8',
    '0xa153ad732f831a79b5575fa02e793ec4e99181b0',
    '0x462cd9e0247b2e63831c3189ae738e5e9a5a4b64',
    '0x9ceed3a7f753608372eeab300486cc7c2f38ac68',
    '0xeb9b5f4eb023ae754ff59a04c9c038d58606dac6'
  )
  AND topic1 IN (
    '0x000000000000000000000000f3e621395fc714b90da337aa9108771597b4e696',
    '0x0000000000000000000000005ee4d837ab84285924ae746eb5622bb6774692be',
	'0x0000000000000000000000005e13d41913adf18bb2acae34228e8d21f3c2f2eb',
	'0x00000000000000000000000033f3d7916615ebdeee66943ed1024d2444efd9fb',
	'0x0000000000000000000000001b0e3da51b2517e09ae74cd31b708e46b9158e8b',
	'0x000000000000000000000000bfb6318123da1682b8bd963846c1e9608f5f3cda',
	'0x00000000000000000000000009e6cab47b7199b9d3839a2c40654f246d518a80',
	'0x000000000000000000000000bcebc1cebdb9704ff4332634d5662e342685af9f',
	'0x000000000000000000000000e08e1f00d388e201e48842e53fa96195568e6813',
	'0x000000000000000000000000fa31599a4928c2d57c0dd77dfca5da1e94e6d2d2',
	'0x0000000000000000000000002e3b32730b4f6b6502bdaa9122df3b026ede5391',
	'0x00000000000000000000000056c44d2f484a61ce92fa0bcc849feb37abfeb59c'
  )
  AND transaction_hash IN (SELECT transaction_hash FROM txs)
GROUP BY date
ORDER BY date DESC
`, {})

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount),
      isUnlock: false
    });
  }
  return result;
}

const euler: Protocol = {
  // treasury: manualCliff(start, 3759791),
  // "early users": manualCliff(start, 271828),
  // shareholders: manualLinear(
  //   cliff,
  //   cliff + periodToSeconds.month * 18,
  //   7026759,
  // ),
  // "DAO partners": manualLinear(
  //   cliff,
  //   cliff + periodToSeconds.month * 18,
  //   2628170,
  // ),
  // "Encode incubator": manualLinear(
  //   cliff,
  //   cliff + periodToSeconds.month * 30,
  //   1087313,
  // ),
  // "employees, advisors, consultants": manualLinear(
  //   cliff,
  //   cliff + periodToSeconds.month * 48,
  //   5613252,
  // ),
  "Incentives": rewards,
  meta: {
    sources: ["https://docs.euler.finance/eul/about"],
    token: "ethereum:0xd9fcd98c322942075a5c3860693e9f4f03aae07b",
    notes: [
      `We track only incentives redeemed rEUL to EUL.`,
      `Euler v2 launched on 4 September 2024`,
    ],
    protocolIds: ["parent#euler"],
  },
  categories: {
    // insiders: [
    //   "employees, advisors, consultants",
    //   "Encode incubator",
    //   "DAO partners",
    //   "shareholders",
    // ],
    farming: ["Incentives"],
    // airdrop: ["early users"],
    // noncirculating: ["treasury"],
  },
};
export default euler;
