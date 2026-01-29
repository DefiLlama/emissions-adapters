import adapter from "../adapters/aave/aave";
import { manualCliff, manualStep } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2, ComponentV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const lendDevQty = 3000000;
const lendSaleQty = 10000000;
const lendSale = 1512777600;

const devSchedule = (portion: number) => [
  manualCliff(lendSale, (lendDevQty * portion) / 5),
  manualStep(lendSale, periodToSeconds.year / 2, 4, (lendDevQty * portion) / 5),
];

const ghoIncentives = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3, 64))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE chain = 1
WHERE address = '0x1a88df1cfe15af22b3c4c783d4e6f7f9e0c1885d'
  AND topic0 = '0x9310ccfcb8de723f578a9e4282ea9f521f05ae40dc08f3068dfad528a65ee3c7'
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

const stkAaveIncentives = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3, 64))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE chain = 1
WHERE address = '0x4da27a545c0c5b758a6ba100e3a049001de870f5'
  AND topic0 = '0x9310ccfcb8de723f578a9e4282ea9f521f05ae40dc08f3068dfad528a65ee3c7'
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

const stkAbptIncentives = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3, 64))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE chain = 1
WHERE address = '0x9eda81c21c273a82be9bbc19b6a6182212068101'
  AND topic0 = '0x9310ccfcb8de723f578a9e4282ea9f521f05ae40dc08f3068dfad528a65ee3c7'
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

const incentivesControllerRewards = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3, 64))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE chain = 1
WHERE address = '0xd784927ff2f95ba542bfc824c8a8a98f3495f6b5'
  AND topic0 = '0x5637d7f962248a7f05a7ab69eec6446e31f3d0a299d997f135a65c62806e7891'
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

const aaveIncentivesSection: SectionV2 = {
  displayName: "AAVE Incentives",
  methodology: "Tracks rewards claimed using event logs from various AAVE contracts",
  isIncentive: true,
  components: [
    {
      id: "gho-incentives",
      name: "GHO Incentives",
      methodology: "Tracks rewards claimed using event logs from GHO contract",
      isIncentive: true,
      fetch: ghoIncentives,
      metadata: {
        contract: "0x1a88df1cfe15af22b3c4c783d4e6f7f9e0c1885d",
        eventSignature: "0x9310ccfcb8de723f578a9e4282ea9f521f05ae40dc08f3068dfad528a65ee3c7"
      }
    },
    {
      id: "stkaave-incentives",
      name: "stkAAVE incentives",
      methodology: "Tracks rewards claimed using event logs from stkAAVE contract",
      isIncentive: false,
      fetch: stkAaveIncentives,
      metadata: {
        contract: "0x4da27a545c0c5B758a6BA100e3a049001de870f5",
        eventSignature: "0x9310ccfcb8de723f578a9e4282ea9f521f05ae40dc08f3068dfad528a65ee3c7"
      }
    },
    {
      id: "stkabpt-incentives",
      name: "stkABPTv2 incentives",
      methodology: "Tracks rewards claimed using event logs from stkAAVE wstETH BPT contract",
      isIncentive: true,
      fetch: stkAbptIncentives,
      metadata: {
        contract: "0x9eDA81C21C273a82BE9Bbc19B6A6182212068101",
        eventSignature: "0x9310ccfcb8de723f578a9e4282ea9f521f05ae40dc08f3068dfad528a65ee3c7"
      }
    },
    {
      id: "incentives-controller",
      name: "IncentivesController",
      methodology: "Tracks rewards claimed using event logs from AAVE incentive controller",
      isIncentive: true,
      fetch: incentivesControllerRewards,
      metadata: {
        contract: "0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5",
        eventSignature: "0x9310ccfcb8de723f578a9e4282ea9f521f05ae40dc08f3068dfad528a65ee3c7"
      }
    }
  ]
};

const aave: ProtocolV2 = {
  "LEND core development": devSchedule(0.3),
  "LEND user experience development": devSchedule(0.2),
  "LEND management and legal": devSchedule(0.2),
  "LEND promotions and marketing": devSchedule(0.2),
  "LEND unexpected costs": devSchedule(0.1),
  "LEND public sale": manualCliff(lendSale, lendSaleQty),
  "Ecosystem reserve": {
    components: [
      {
        id: "ecosystem-reserve",
        name: "Ecosystem Reserve",
        isTBD: true,
        fetch: async () =>
          adapter("0x25F2226B597E8F9514B3F68F00f494cF4f286491", "ethereum"),
      }
    ]
  },
  "AAVE Incentives": aaveIncentivesSection,
  meta: {
    version: 2,
    sources: [
      "https://docs.aave.com/aavenomics/incentives-policy-and-aave-reserve",
      "https://etherscan.io/tx/0x751c299f081d1a763cb6eff46616574a822b7d3376168e406e25ba03293e17b2",
      "https://github.com/ETHLend/Documentation/blob/master/ETHLendWhitePaper.md#token-distribution",
    ],
    token: "ethereum:0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    protocolIds: ["parent#aave", "111", "1599", "1838", "1839"],
    incompleteSections: [
      {
        key: "Ecosystem reserve",
        allocation: lendDevQty,
        lastRecord: () => 0,
      },
    ],
  },
  categories: {
    noncirculating: ["Ecosystem reserve"],
    publicSale: ["LEND to AAVE migrator"],
    farming: ["AAVE Incentives"],
  },
};
export default aave;
