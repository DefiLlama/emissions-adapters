import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds, readableToSeconds } from "../utils/time";
import { queryDuneSQLCached } from "../utils/dune";
import { queryAggregatedDailyLogsAmounts } from "../utils/queries";

const total = 200_000_000;
const start = 1500940800; // July 25, 2017
const bscLaunch = 1598918400; // September 1, 2020
const shares = {
  ico: total * 0.5,
  team: total * 0.4,
  investors: total * 0.1,
};

const stakingRewards = async (): Promise<CliffAdapterResult[]> => {
  return queryDuneSQLCached(
    `SELECT
      to_unixtime(DATE_TRUNC('day', block_time)) AS date,
      SUM(
        VARBINARY_TO_UINT256(VARBINARY_LTRIM(VARBINARY_SUBSTRING(data, 1, 32))) / POWER(10, 18) +
        VARBINARY_TO_UINT256(VARBINARY_LTRIM(VARBINARY_SUBSTRING(data, 33, 32))) / POWER(10, 18)
      ) AS amount
    FROM bnb.logs a
    JOIN dune.bnbchain.dataset_dataset_validatorlist b
      ON a.contract_address = b.credit_token_address
    WHERE topic0 = 0xfb0e1482d62102ab9594f69d4c6d693749e3e2bf1c21af272f5456b2d5a4f6b5
      AND block_time >= START
    GROUP BY 1
    ORDER BY 1`,
    bscLaunch,
    { protocolSlug: "binance-smart-chain", allocation: "Staking Rewards" },
  );
};

// Quarterly auto-burns from https://www.bnbburn.info/
const autoBurnsCutoff = 1774483200
const autoBurns: [string, number][] = [
  ["2017-10-18",  986_000],       
  ["2018-01-15",  1_821_586],   
  ["2018-04-15",  2_220_314],   
  ["2018-07-18",  2_528_767],    
  ["2018-10-17",  1_643_986],    
  ["2019-01-16",  1_623_818],   
  ["2019-04-16",  829_888],      
  ["2019-07-12",  808_888],      
  ["2019-10-17",  2_061_888],    
  ["2020-01-17",  2_216_888],    
  ["2020-04-17",  3_373_988],     
  ["2020-07-18",  3_477_388],    
  ["2020-10-17",  2_253_888],
  ["2021-01-19",  3_619_888],
  ["2021-04-16",  1_099_888],    
  ["2021-07-18",  1_296_728],    
  ["2021-10-18",  1_335_888],     
  ["2022-01-18",  1_684_387],   
  ["2022-04-15",  1_839_786],    
  ["2022-07-21",  1_959_595],    
  ["2022-10-13",  2_065_152],   
  ["2023-01-17",  2_064_494],    
  ["2023-04-14",  2_020_132],    
  ["2023-07-17",  1_991_854],     
  ["2023-10-20",  2_139_182],  
  ["2024-01-22",  2_141_487],    
  ["2024-04-24",  1_944_453],    
  ["2024-07-22",  1_643_698.8],   
  ["2024-10-25",  1_710_142.733], 
  ["2025-01-22",  1_634_200.953], 
  ["2025-04-17",  1_579_108.637], 
  ["2025-07-21",  1_595_599.784], 
  ["2025-10-20",  1_441_281.413], 
  ["2026-01-22",  1_371_803.765],
];

const quarterlyBurnsDune = async (): Promise<CliffAdapterResult[]> => {
  const results = await queryDuneSQLCached(
    `SELECT
      to_unixtime(DATE_TRUNC('day', block_time)) AS date,
      SUM(value / 1e18) AS amount
    FROM bnb.traces
    WHERE "from" = 0x00389542170D59184DC056f942B3A8234d5318C9
      AND "to" = 0x000000000000000000000000000000000000dead
      AND success = true
      AND value > UINT256 '0'
      AND block_time >= START
    GROUP BY 1
    ORDER BY 1`,
    autoBurnsCutoff,
    { protocolSlug: "binance-smart-chain", allocation: "Quarterly Burns" },
  );
  return results.filter((r) => r.start >= autoBurnsCutoff).map((r) => ({ ...r, amount: -Math.abs(r.amount) }));
};

const stakingSection: SectionV2 = {
  displayName: "Staking Rewards",
  methodology: "Tracks daily BNB validator staking rewards from credit token distribution events on BSC",
  components: [
    {
      id: "validator-staking",
      name: "Validator Staking Rewards",
      isIncentive: false,
      methodology: "Queries Dune for daily validator reward distributions via credit token events, joined with the BNB Chain validator list.",
      fetch: stakingRewards,
    },
  ],
};

const gasBurns = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryAggregatedDailyLogsAmounts({
    address: "0x0000000000000000000000000000000000001000",
    topic0: "0x627059660ea01c4733a328effb2294d2f86905bf806da763a89cee254de8bee5",
    startDate: "2020-09-01",
    chain: 56,
  });

  return data.map((row) => ({
    type: "cliff" as const,
    start: readableToSeconds(row.date),
    amount: -Number(row.amount) / 1e18,
    isUnlock: false
  }));
};

const bsc: ProtocolV2 = {
  "ICO": manualCliff(start, shares.ico),
  "Founding Team": manualStep(start, periodToSeconds.year, 5, shares.team / 5),
  "Angel Investors": manualCliff(start, shares.investors),
  "Staking Rewards": stakingSection,
  "Quarterly Burns": [
    ...autoBurns.map(([date, amount]) => manualCliff(date, -amount)),
    quarterlyBurnsDune,
  ],
  "Gas Burns": gasBurns,
  "Bridge Hack": [
    manualCliff("2022-10-07", 2_000_000),
    manualCliff("2022-10-07", -1_020_000),
  ],
  "TokenHub Locked": manualCliff("2020-09-01", -6_823),
  "Beacon Chain Fusion Burn": manualCliff("2024-06-12", -110_000),
  meta: {
    token: "coingecko:binancecoin",
    sources: [
      "https://www.exodus.com/assets/docs/binance-coin-whitepaper.pdf",
      "https://www.bnbburn.info/",
      "https://docs.bnbchain.org/bnb-smart-chain/overview/#bnb-token",
    ],
    version: 2,
    total,
    chain: "bsc",
    protocolIds: ["6236"],
    notes: [
      "Initial supply was 200M BNB, distributed as 50% ICO, 40% founding team, 10% angel investors.",
      "Angel investor vesting details were not publicly disclosed, we assumed they were unlocked at launch.",
      "Dead Address Burns tracks native BNB sent to 0x...dead (includes Auto Burns + Community Burns).",
      "Gas Burns tracks BEP-95 real-time fee burns via feeBurned events on BSC Validator Set contract.",
      "Bridge Hack: 2M BNB minted Oct 2022, 1.02M locked on-chain (treated as burned).",
      "6,823 BNB locked in TokenHub contract by user misoperation (treated as burned).",
      "110K BNB from Beacon Chain validators locked during BNB Chain Fusion (treated as burned).",
    ],
  },

  categories: {
    publicSale: ["ICO"],
    insiders: ["Founding Team"],
    privateSale: ["Angel Investors"],
    staking: ["Staking Rewards"],
    burned: [
      "Quarterly Burns", 
      "Gas Burns", 
      "Bridge Hack",
      "TokenHub Locked",
      "Beacon Chain Fusion Burn"
     ]
  },
};

export default bsc;
