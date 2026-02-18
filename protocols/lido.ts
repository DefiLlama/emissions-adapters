import { manualLinear } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const qty: number = 1e9;
const token: string = "0x5a98fcbea516cf06857215779fd812ca3bef1b32";
const timestampDeployed: number = 1609804800;
const chain: string = "ethereum";

const schedule = (proportion: number) =>
  manualLinear("2021-12-17", "2022-12-17", qty * proportion);

const transferTopic0 = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const ethSourceWallets = [
  "0x3e40d73eb977dc6a537af587d48316fee66e9c8c",
  "0x87d93d9b2c672bf9c9642d853a8682546a5012b5",
  "0x753d5167c31fbeb5b49624314d74a957eb271709",
  "0x55c8de1ac17c1a937293416c9bce5789cbbf61d1",
  "0x12a43b049a7d330cb8aeab5113032d18ae9a9030",
  "0x17f6b2c738a63a8d3a113a228cfd0b373244633d",
  "0xde06d17db9295fa8c4082d4f73ff81592a3ac437",
  "0x834560f580764bc2e0b16925f8bf229bb00cb759",
  "0x13c6ef8d45afbccf15ec0701567cc9fad2b63ce8",
];

const bridgeContracts = [
  "0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf",
  "0xa3a7b6f88361f48403514059f1f16c8e78d60eec",
  "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1",
];

const toResultArray = (data: any[]): CliffAdapterResult[] =>
  data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false,
  }));

const buildChainQuery = (
  chainId: string,
  tokenAddress: string,
  sourceWallets: string[],
  exclusionList: string[],
) => `WITH
source_wallets AS (
    SELECT arrayJoin([${sourceWallets.map((w) => `'${w}'`).join(", ")}]) AS address
),
exclusion_list AS (
    SELECT arrayJoin([${exclusionList.map((w) => `'${w}'`).join(", ")}]) AS address
)
SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE chain = '${chainId}' AND short_address = '${tokenAddress.slice(0, 10)}' AND short_topic0 = '0xddf252ad'
WHERE
    topic0 = '${transferTopic0}'
    AND address = '${tokenAddress}'
    AND lower(concat('0x', substring(topic1, 27))) IN (SELECT address FROM source_wallets)
    AND lower(concat('0x', substring(topic2, 27))) NOT IN (SELECT address FROM exclusion_list)
    AND topic2 != '0x0000000000000000000000000000000000000000000000000000000000000000'
GROUP BY date
ORDER BY date DESC`;

const allSourceWallets = [
  ...ethSourceWallets,
  "0x5033823f27c5f977707b58f0351adcd732c955dd",
  "0x8c2b8595ea1b627427efe4f29a64b145df439d16",
];
const exclusionList = [...allSourceWallets, ...bridgeContracts];

const ethereumRewards = async (): Promise<CliffAdapterResult[]> =>
  toResultArray(await queryCustom(buildChainQuery("1", "0x5a98fcbea516cf06857215779fd812ca3bef1b32", ethSourceWallets, exclusionList), {}));

const optimismRewards = async (): Promise<CliffAdapterResult[]> =>
  toResultArray(await queryCustom(buildChainQuery("10", "0xfdb794692724153d1488ccdbe0c56c252596735f", ["0x5033823f27c5f977707b58f0351adcd732c955dd"], exclusionList), {}));

const arbitrumRewards = async (): Promise<CliffAdapterResult[]> =>
  toResultArray(await queryCustom(buildChainQuery("42161", "0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60", ["0x8c2b8595ea1b627427efe4f29a64b145df439d16"], exclusionList), {}));

const incentivesSection: SectionV2 = {
  displayName: "Incentives",
  methodology: "Tracks LDO token distributions from known treasury and incentive wallets",
  isIncentive: true,
  components: [
    {
      id: "ethereum-incentives",
      name: "Ethereum Incentives",
      methodology: "LDO transfers from 9 source wallets on Ethereum, excluding inter-wallet and bridge transfers",
      isIncentive: true,
      fetch: ethereumRewards,
      metadata: {
        contract: "0x5a98fcbea516cf06857215779fd812ca3bef1b32",
        chain: "ethereum",
        chainId: "1",
        eventSignature: transferTopic0,
      },
    },
    {
      id: "optimism-incentives",
      name: "Optimism Incentives",
      methodology: "LDO transfers from incentive wallet on Optimism, excluding inter-wallet and bridge transfers",
      isIncentive: true,
      fetch: optimismRewards,
      metadata: {
        contract: "0xfdb794692724153d1488ccdbe0c56c252596735f",
        chain: "optimism",
        chainId: "10",
        eventSignature: transferTopic0,
      },
    },
    {
      id: "arbitrum-incentives",
      name: "Arbitrum Incentives",
      methodology: "LDO transfers from incentive wallet on Arbitrum, excluding inter-wallet and bridge transfers",
      isIncentive: true,
      fetch: arbitrumRewards,
      metadata: {
        contract: "0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60",
        chain: "arbitrum",
        chainId: "42161",
        eventSignature: transferTopic0,
      },
    },
  ],
};

const lido: ProtocolV2 = {
  Investors: schedule(0.2218),
  "Validators & Signature Holders": schedule(0.065),
  "Initial Lido Developers": schedule(0.2),
  "Founders & Future Employees": schedule(0.15),
  "Incentives": incentivesSection,
  meta: {
    version: 2,
    notes: ["We are tracking LDO token distribution from known wallets as incentives"],
    sources: [`https://blog.lido.fi/introducing-ldo/`],
    token: `${chain}:${token}`,
    protocolIds: ["182"],
  },
  categories: {
    farming: ["Incentives"],
    privateSale: ["Investors"],
    insiders: [
      "Validators & Signature Holders",
      "Initial Lido Developers",
      "Founders & Future Employees",
    ],
  },
};
export default lido;
