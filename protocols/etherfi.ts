import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = 1710284400;
const total = 1e9;
const token = "0xfe0c30065b384f05761f15d0cc899d4f9f9cc0eb";
const chain = "ethereum";

// Event signatures
const CLAIMED_MERKLE = "0x4ec90e965519d92681267467f775ada5bd214aa92c0dc93d90a5e880ce9ed026"; // Claimed(uint256,address,uint256) - all fields in data
const CLAIMED_LIQUID = "0x8b1927e0809f1e7682bb8c52fafe4c0445fea47afef60dd27e037e91fd104d2e"; // Claimed(bytes32,address,address,uint256)
const CASHBACK_V3 = "0xeb47a17fe64c36c7ac73cc029dd561d73e8df11215ed25fbb8c30653bf6d3a72";
const CASHBACK_V4 = "0x0b79a9660f2e7ba216d6c8c6aa4a73dff96833d3c0b14a067da90c3b1f3118dc";

// Ethereum MerkleDistributor contracts (Season 1-3 tranches)
const ETH_MERKLE_CONTRACTS = [
  "0x93fff4028927f53f708534397ed349b9cd4e2f9f", // S1T1
  "0x1baa2146e5b258a2cc516166a095dbc22caacfe6", // S1T2
  "0x227dd729c7ca1eb91c22dac0c4b1abad75b8365a", // S1T3
  "0x64776b0907b839e759f91a5a328ea143067ddcd7", // S2T1
  "0x87eb1c0f3827cb91bef234f61e4a5594280754e9", // S2T2
  "0x7aec93210fd857bfb1e7919cb9ef30731494c003", // S2T3
  "0x0c1e1a20566321de81841e61a75b2b949610cb39", // S2T4
  "0xbd456973dfd5b00b07ce5307110c77e3f228ca3c", // S3T1
  "0xce6460b8e97d7be72a9f525fa5b49c62d06d2b46", // S3T2
  "0xf5a6d0642c7e02b250a5ada440f901d211b40506", // S3T3
];

// Liquid ETH Rewards contracts (standard Claimed event)
const ETH_LIQUID_STANDARD = [
  "0xa8037a13f5b0d6dc91a1c4c75b31a79a2986e24b", // Liquid ETH Rewards 2
  "0x2882f978460d1229f1d0414ce91d0061b81adc2c", // Liquid ETH Rewards 3
];

// Liquid ETH Rewards 1 (different Claimed event: bytes32,address,address,uint256)
const ETH_LIQUID_V1 = "0xf0164d48b308c42ae028e3379b2fb620e70f8780";

// All standard Claimed contracts on Ethereum
const ETH_STANDARD_CONTRACTS = [...ETH_MERKLE_CONTRACTS, ...ETH_LIQUID_STANDARD];

// Arbitrum MerkleDistributor contracts
const ARB_CONTRACTS = [
  "0xc5fde679f52e9bd896ab1dee5265f9a80c672512", // S2T1
  "0x2c999fd1543dd5a228acd0173092af10e3a8eeda", // S2T2
  "0x390624d61f03075d7e14d909d6c3f46ecac8b984", // S2T3
  "0x4dea1271dfae80f4f3324b3a50c33abdbea89a57", // S3T1
  "0x637ee65658cb8f6524c051f76677e791ddc10bd4", // S3T2
];

// Base MerkleDistributor contracts
const BASE_CONTRACTS = [
  "0x7b6a67f1031c1d8c7bab1cf001bdaf83271241fb", // S3T1
];

// Scroll CashEventEmitter contracts
const SCROLL_EMITTERS = [
  "0x380b2e96799405be6e3d965f4044099891881acb",
  "0x357b440cfcd9677a99f2f85d5297c141b8837a9b",
];

const toResultArray = (data: any[]): CliffAdapterResult[] =>
  data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false,
  }));

const buildClaimedQuery = (
  chainId: string,
  contracts: string[],
): string => {
  const shortAddresses = contracts.map(a => `'${a.slice(0, 10)}'`).join(", ");
  const fullAddresses = contracts.map(a => `'${a}'`).join(", ");
  return `
    SELECT toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 131, 64))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '${chainId}'
      AND short_address IN (${shortAddresses})
      AND short_topic0 = '${CLAIMED_MERKLE.slice(0, 10)}'
    WHERE address IN (${fullAddresses})
      AND topic0 = '${CLAIMED_MERKLE}'
    GROUP BY date ORDER BY date DESC`;
};

const ethereumClaims = async (): Promise<CliffAdapterResult[]> => {
  // Standard Claimed from MerkleDistributors + Liquid ETH Rewards 2,3
  const standard = queryCustom(buildClaimedQuery("1", ETH_STANDARD_CONTRACTS), {});

  // Liquid ETH Rewards 1 (different event, filter by ETHFI token)
  const liquid1 = queryCustom(`
    SELECT toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 195, 64))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '1'
      AND short_address = '${ETH_LIQUID_V1.slice(0, 10)}'
      AND short_topic0 = '${CLAIMED_LIQUID.slice(0, 10)}'
    WHERE address = '${ETH_LIQUID_V1}'
      AND topic0 = '${CLAIMED_LIQUID}'
      AND lower(concat('0x', substring(data, 155, 40))) = '${token}'
    GROUP BY date ORDER BY date DESC
  `, {});

  const [standardData, liquid1Data] = await Promise.all([standard, liquid1]);

  // Merge daily amounts
  const dailyMap = new Map<string, number>();
  for (const d of [...standardData, ...liquid1Data] as any[]) {
    const key = d.date;
    dailyMap.set(key, (dailyMap.get(key) || 0) + Number(d.amount));
  }
  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, amount]) => ({
      type: "cliff" as const,
      start: readableToSeconds(date),
      amount,
      isUnlock: false,
    }));
};

const arbitrumClaims = async (): Promise<CliffAdapterResult[]> =>
  toResultArray(await queryCustom(buildClaimedQuery("42161", ARB_CONTRACTS), {}));

const baseClaims = async (): Promise<CliffAdapterResult[]> =>
  toResultArray(await queryCustom(buildClaimedQuery("8453", BASE_CONTRACTS), {}));

const scrollCashback = async (): Promise<CliffAdapterResult[]> => {
  const shortAddresses = SCROLL_EMITTERS.map(a => `'${a.slice(0, 10)}'`).join(", ");
  const fullAddresses = SCROLL_EMITTERS.map(a => `'${a}'`).join(", ");

  // V3: cashbackAmountToSafe + cashbackAmountToSpender
  const v3 = queryCustom(`
    SELECT toStartOfDay(timestamp) AS date,
      SUM(
        reinterpretAsUInt256(reverse(unhex(substring(data, 131, 64)))) +
        reinterpretAsUInt256(reverse(unhex(substring(data, 259, 64))))
      ) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '534352'
      AND short_address IN (${shortAddresses})
      AND short_topic0 = '${CASHBACK_V3.slice(0, 10)}'
    WHERE address IN (${fullAddresses})
      AND topic0 = '${CASHBACK_V3}'
    GROUP BY date ORDER BY date DESC
  `, {});

  // V4: cashbackAmountInToken
  const v4 = queryCustom(`
    SELECT toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 131, 64))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '534352'
      AND short_address IN (${shortAddresses})
      AND short_topic0 = '${CASHBACK_V4.slice(0, 10)}'
    WHERE address IN (${fullAddresses})
      AND topic0 = '${CASHBACK_V4}'
    GROUP BY date ORDER BY date DESC
  `, {});

  const [v3Data, v4Data] = await Promise.all([v3, v4]);

  // Merge daily amounts
  const dailyMap = new Map<string, number>();
  for (const d of [...v3Data, ...v4Data] as any[]) {
    const key = d.date;
    dailyMap.set(key, (dailyMap.get(key) || 0) + Number(d.amount));
  }
  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, amount]) => ({
      type: "cliff" as const,
      start: readableToSeconds(date),
      amount,
      isUnlock: false,
    }));
};

const incentivesSection: SectionV2 = {
  displayName: "Incentives",
  methodology: "Tracks ETHFI reward claims from seasonal MerkleDistributor contracts and Liquid ETH Rewards across Ethereum, Arbitrum, Base, plus cashback distributions on Scroll",
  isIncentive: true,
  components: [
    {
      id: "ethereum-claims",
      name: "Ethereum ETHFI Claims",
      methodology: "Tracks Claimed events from 10 MerkleDistributor season tranche contracts and 3 Liquid ETH Rewards contracts on Ethereum. Handles two event variants: standard Claimed(uint256,address,uint256) and Claimed(bytes32,address,address,uint256) filtered by ETHFI token.",
      isIncentive: true,
      fetch: ethereumClaims,
      metadata: {
        contracts: [...ETH_STANDARD_CONTRACTS, ETH_LIQUID_V1],
        chain: "ethereum",
        chainId: "1",
        eventSignatures: [CLAIMED_MERKLE, CLAIMED_LIQUID],
      },
    },
    {
      id: "arbitrum-claims",
      name: "Arbitrum ETHFI Claims",
      methodology: "Tracks Claimed events from 5 MerkleDistributor season tranche contracts on Arbitrum (Season 2-3).",
      isIncentive: true,
      fetch: arbitrumClaims,
      metadata: {
        contracts: ARB_CONTRACTS,
        chain: "arbitrum",
        chainId: "42161",
        eventSignature: CLAIMED_MERKLE,
      },
    },
    {
      id: "base-claims",
      name: "Base ETHFI Claims",
      methodology: "Tracks Claimed events from MerkleDistributor on Base (Season 3 Tranche 1).",
      isIncentive: true,
      fetch: baseClaims,
      metadata: {
        contracts: BASE_CONTRACTS,
        chain: "base",
        chainId: "8453",
        eventSignature: CLAIMED_MERKLE,
      },
    },
    {
      id: "scroll-cashback",
      name: "Scroll Cashback",
      methodology: "Tracks Cashback events from CashEventEmitter on Scroll. Handles two protocol versions: V3 (cashbackAmountToSafe + cashbackAmountToSpender) and V4 (cashbackAmountInToken). Cashback distributed in weETH.",
      isIncentive: true,
      fetch: scrollCashback,
      metadata: {
        contracts: SCROLL_EMITTERS,
        chain: "scroll",
        chainId: "534352",
        cashbackToken: "0xd29687c813d741e2f938f4ac377128810e217b1b",
        eventSignatures: [CASHBACK_V3, CASHBACK_V4],
      },
    },
  ],
};

const etherfi: ProtocolV2 = {
  "Core Contributors": [
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(2),
      total * 0.160987500,
    ),
    manualLinear(
      start + periodToSeconds.years(2),
      start + periodToSeconds.years(3),
      total * 0.0536625,
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
  "Incentives": incentivesSection,
  meta: {
    version: 2,
    token: `${chain}:${token}`,
    notes: [
      "User Airdrops and Partnerships section schedules inferred from source chart",
      "ETHFI claims tracked via Claimed events from MerkleDistributor and Liquid ETH Rewards contracts",
      "Scroll cashback tracked via Cashback events from CashEventEmitter (weETH token)",
    ],
    sources: [
      "https://etherfi.medium.com/announcing-ethfi-the-ether-fi-governance-token-8cae7327763a",
      "https://etherfi.gitbook.io/etherfi/contracts-and-integrations/deployed-contracts",
    ],
    protocolIds: ["parent#ether-fi"],
  },
  categories: {
    noncirculating: ["Foundation", "Ecosystem Development", "Treasury"],
    privateSale: ["Investors"],
    insiders: ["Core Contributors"],
    farming: ["Incentives"],
  },
};

export default etherfi;
