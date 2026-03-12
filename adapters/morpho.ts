import fetch from "node-fetch";
import { CliffAdapterResult } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const MERKL_API = "https://api.merkl.xyz/v4/campaigns";
const DAO_CREATOR_TAG = "morpho";
const MERKL_CHAINS = [1, 8453, 42161];
const RECENT_DAYS = 90;

// Known MORPHO token addresses (lowercased) per chain
const MORPHO_TOKENS: Record<number, string[]> = {
  1: [
    "0x9994e35db50125e0df82e4c2dde62496ce330999",
    "0x58d97b57bb95320f9a05dc918aef65434969c2b2", // old MORPHO
  ],
  8453: ["0xbaa5cc21fd487b8fcc2f632f3f4e8d37262a0842"],
  42161: [],
};

interface MerklCampaign {
  dailyRewards: number; // in USD
  amount: string; // total reward in wei
  startTimestamp: number;
  endTimestamp: number;
  rewardToken: {
    address: string;
    symbol: string;
    decimals: number;
    price: number;
  };
}

// Returns daily DAO MORPHO emissions in tokens (not USD)
async function fetchMerklDaoDaily(): Promise<number> {
  const now = Math.floor(Date.now() / 1000);
  let totalDailyTokens = 0;
  for (const chainId of MERKL_CHAINS) {
    try {
      const url = `${MERKL_API}?chainId=${chainId}&creatorTag=${DAO_CREATOR_TAG}&items=100&excludeSubCampaigns=true`;
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const campaigns = (await resp.json()) as MerklCampaign[];
      const knownAddrs = MORPHO_TOKENS[chainId] ?? [];
      for (const c of campaigns) {
        if (!c.dailyRewards || c.dailyRewards <= 0) continue;
        if (c.endTimestamp <= now) continue;
        const addr = c.rewardToken?.address?.toLowerCase();
        if (knownAddrs.length > 0 && !knownAddrs.includes(addr)) continue;
        if (knownAddrs.length === 0 && c.rewardToken?.symbol?.toUpperCase() !== "MORPHO") continue;
        // dailyRewards is in USD — convert to token amount using amount / duration
        const durationSecs = c.endTimestamp - c.startTimestamp;
        if (durationSecs <= 0) continue;
        const totalTokens = Number(BigInt(c.amount)) / 10 ** c.rewardToken.decimals;
        const dailyTokens = totalTokens / (durationSecs / 86400);
        totalDailyTokens += dailyTokens;
      }
    } catch {
      continue;
    }
  }
  return totalDailyTokens;
}

export default async function morpho(): Promise<CliffAdapterResult[]> {
  // Cutoff: old URD data stops where Merkl API data begins (avoids double-counting
  // since old URDs are still actively claimed but Merkl API covers current DAO spend)
  const cutoffTs = Math.floor(Date.now() / 1000) - RECENT_DAYS * 86400;
  const cutoffDate = new Date(cutoffTs * 1000).toISOString().split("T")[0];

  const [urdData, daoDaily] = await Promise.all([
    // Historical claims from old Morpho URDs only, before the Merkl API window.
    // Excludes Merkl distributor (0x3ef3d8ba) which mixes DAO and third-party MORPHO.
    queryCustom(
      `
SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
PREWHERE short_address IN ('0x330eefa8', '0x5400dbb2', '0x678ddc1d') AND short_topic0 = '0xf7a40077'
WHERE topic0 = '0xf7a40077ff7a04c7e61f6f26fb13774259ddf1b6bce9ecf26a8276cdd3992683'
AND address IN (
    '0x330eefa8a787552dc5cad3c3ca644844b1e61ddb',
    '0x5400dbb270c956e8985184335a1c62aca6ce1333',
    '0x678ddc1d07eaa166521325394cdeb1e4c086df43'
)
AND topic2 IN (
    '0x00000000000000000000000058d97b57bb95320f9a05dc918aef65434969c2b2',
    '0x0000000000000000000000009d03bb2092270648d7480049d0e58d2fcf0e5123',
    '0x0000000000000000000000009994e35db50125e0df82e4c2dde62496ce330999',
    '0x000000000000000000000000baa5cc21fd487b8fcc2f632f3f4e8d37262a0842',
    '0x00000000000000000000000040bd670a58238e6e230c430bbb5ce6ec0d40df48'
)
AND timestamp < toDateTime('${cutoffDate}')
GROUP BY date
ORDER BY date DESC;
    `,
      {},
    ),
    // Current DAO-only daily emissions from Merkl API
    fetchMerklDaoDaily(),
  ]);

  const result: CliffAdapterResult[] = [];

  // Add historical URD claims
  for (const d of urdData) {
    result.push({
      type: "cliff",
      start: readableToSeconds(d.date),
      amount: Number(d.amount),
      isUnlock: false,
    });
  }

  // Add recent DAO emissions from Merkl API (last 90 days)
  if (daoDaily > 0) {
    const now = Math.floor(Date.now() / 1000);
    const startTs = now - RECENT_DAYS * 86400;
    for (let ts = startTs; ts < now; ts += 86400) {
      const dayStart = ts - (ts % 86400);
      result.push({
        type: "cliff",
        start: dayStart,
        amount: daoDaily,
        isUnlock: false,
      });
    }
  }

  return result;
}