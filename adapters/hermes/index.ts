import { ChainApi } from "@defillama/sdk";
import { LinearAdapterResult, TimeSeriesChainData } from "../../types/adapters";
import { PromisePool } from "@supercharge/promise-pool";
import { getBlock } from "@defillama/sdk/build/computeTVL/blocks";
import { unixTimestampNow } from "../../utils/time";
import { mintEventAbi, TOKEN_UNSTAKED_TOPIC } from "./abi";

interface HermesChainData extends TimeSeriesChainData {
  [block: string]: {
    timestamp: number;
    emissions?: {
      rebase: bigint;
      dao: bigint;
    };
  };
}

interface GaugeChainData extends TimeSeriesChainData {
  [block: string]: {
    timestamp: number;
    gaugeRewards?: bigint;
  };
}

const MINTER_ADDRESS = "0x000000B473F20DEA03618d00315900eC5900dc59";
const UNISWAP_V3_STAKER = "0x54De3b7b5D1993Db4B2a93C897b5272FBd60e99E";
const START_BLOCK = 136000000;

export type EmissionType = "gauge" | "rebase" | "dao";

interface CacheData {
  mintChainData: HermesChainData | null;
  gaugeChainData: GaugeChainData | null;
  currentPromise: Promise<void> | null;
  lastUpdate: number;
}

const cache: CacheData = {
  mintChainData: null,
  gaugeChainData: null,
  currentPromise: null,
  lastUpdate: 0,
};

const CACHE_DURATION = 5 * 60 * 1000;

async function getCachedChainData(): Promise<void> {
  const now = Date.now();

  if (cache.currentPromise) return cache.currentPromise;
  if (cache.mintChainData && cache.gaugeChainData && now - cache.lastUpdate < CACHE_DURATION) {
    return;
  }

  cache.currentPromise = fetchChainData().finally(() => {
    cache.lastUpdate = Date.now();
    setTimeout(() => (cache.currentPromise = null), 1000);
  });

  return cache.currentPromise;
}

async function fetchChainData(): Promise<void> {
  const api = new ChainApi({
    chain: "arbitrum",
  });

  const mintChainData: HermesChainData = {};
  const gaugeChainData: GaugeChainData = {};
  const toBlock = (await getBlock("arbitrum", unixTimestampNow())).number;

  // Fetch Mint events first to determine actual start block
  const mintLogs = await api.getLogs({
    target: MINTER_ADDRESS,
    eventAbi: mintEventAbi,
    fromBlock: START_BLOCK,
    toBlock,
    chain: "arbitrum",
    entireLog: true,
    parseLog: true,
  });

  // Use the first Mint block as the actual start for TokenUnstaked events
  const actualStartBlock = mintLogs.length > 0
    ? Math.min(...mintLogs.map((l: any) => l.blockNumber))
    : START_BLOCK;

  const unstakeLogs = await api.getLogs({
    target: UNISWAP_V3_STAKER,
    topics: [TOKEN_UNSTAKED_TOPIC],
    fromBlock: actualStartBlock,
    toBlock,
    chain: "arbitrum",
    entireLog: true,
  });

  // Process Mint events for rebase and dao emissions
  await processBlocks(mintLogs, mintChainData);

  for (const mintLog of mintLogs) {
    const growth = BigInt(mintLog.parsedLog.args.growth);
    const daoShare = BigInt(mintLog.parsedLog.args.daoShare);

    if (mintChainData[mintLog.blockNumber]) {
      mintChainData[mintLog.blockNumber].emissions = {
        rebase: growth,
        dao: daoShare,
      };
    }
  }

  // Sort mint logs by block number to get epoch boundaries
  const sortedMintBlocks = Object.keys(mintChainData)
    .map(Number)
    .sort((a, b) => a - b);

  // Aggregate TokenUnstaked rewards between each Mint event (epoch)
  for (let i = 0; i < sortedMintBlocks.length; i++) {
    const epochStartBlock = sortedMintBlocks[i];
    const epochEndBlock = i < sortedMintBlocks.length - 1
      ? sortedMintBlocks[i + 1]
      : toBlock;

    // Sum all unstake rewards in this epoch
    // TokenUnstaked(uint256 indexed tokenId, uint256 indexed reward)
    // Both params are indexed, so they're in topics, not data
    // topics[0] = event sig, topics[1] = tokenId, topics[2] = reward
    let epochGaugeRewards = BigInt(0);
    for (const unstakeLog of unstakeLogs) {
      const blockNum = unstakeLog.blockNumber;
      if (blockNum >= epochStartBlock && blockNum < epochEndBlock) {
        const reward = BigInt(unstakeLog.topics[2]);
        epochGaugeRewards += reward;
      }
    }

    gaugeChainData[epochStartBlock] = {
      timestamp: mintChainData[epochStartBlock].timestamp,
      gaugeRewards: epochGaugeRewards,
    };
  }

  cache.mintChainData = mintChainData;
  cache.gaugeChainData = gaugeChainData;
}

async function processBlocks(mintLogs: any[], chainData: HermesChainData) {
  const api = new ChainApi({
    chain: "arbitrum",
  });

  const blockNumbers = [...new Set(mintLogs.map((log) => log.blockNumber))];
  await PromisePool.withConcurrency(10)
    .for(blockNumbers)
    .process(async (blockNum) => {
      const block = await api.provider.getBlock(blockNum);
      if (block?.timestamp) {
        chainData[blockNum] = {
          timestamp: block.timestamp,
        };
      }
    });
}

function processMintChainData(
  chainData: HermesChainData,
  type: "rebase" | "dao"
): LinearAdapterResult[] {
  const blocks = Object.keys(chainData).sort(
    (a, b) => chainData[a].timestamp - chainData[b].timestamp
  );

  const sections: LinearAdapterResult[] = [];

  for (let i = 0; i < blocks.length - 1; i++) {
    const currentBlock = blocks[i];
    const nextBlock = blocks[i + 1];

    const currentData = chainData[currentBlock];
    const nextData = chainData[nextBlock];

    if (!currentData?.emissions?.[type]) continue;

    const amount = Number(currentData.emissions[type]) / 1e18;
    if (amount <= 0) continue;

    sections.push({
      type: "linear",
      start: currentData.timestamp,
      end: nextData.timestamp,
      amount,
    });
  }

  return sections;
}

function processGaugeChainData(chainData: GaugeChainData): LinearAdapterResult[] {
  const blocks = Object.keys(chainData).sort(
    (a, b) => chainData[a].timestamp - chainData[b].timestamp
  );

  const sections: LinearAdapterResult[] = [];

  for (let i = 0; i < blocks.length - 1; i++) {
    const currentBlock = blocks[i];
    const nextBlock = blocks[i + 1];

    const currentData = chainData[currentBlock];
    const nextData = chainData[nextBlock];

    if (currentData?.gaugeRewards === undefined) continue;

    const amount = Number(currentData.gaugeRewards) / 1e18;
    if (amount <= 0) continue;

    sections.push({
      type: "linear",
      start: currentData.timestamp,
      end: nextData.timestamp,
      amount,
    });
  }

  return sections;
}

export async function getHermesEmissions(
  type: EmissionType = "gauge"
): Promise<LinearAdapterResult[]> {
  await getCachedChainData();

  if (type === "gauge") {
    return processGaugeChainData(cache.gaugeChainData!);
  } else {
    return processMintChainData(cache.mintChainData!, type);
  }
}
