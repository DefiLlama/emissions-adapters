import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = 1745452800; // April 24, 2025 00:00 UTC (TGE)
const total = 1e9;
const year = periodToSeconds.year;

// Cliff end timestamp
const cliffEnd = start + year; // April 24, 2026

// ClickHouse query for oDOLO emissions (mints from zero address) on Berachain
const odoloEmissions = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '80094'
    WHERE topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      AND address = '0x02e513b5b54ee216bf836ceb471507488fc89543'
      AND topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000'
    GROUP BY date
    ORDER BY date DESC
  `, {});

  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false,
  }));
};

// ClickHouse query for oARB claims on Arbitrum (older liquidity mining program)
const oarbEmissions = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '42161'
    WHERE address = '0x66cd7d0cc677f42f6662622c60a5e60ef573db67'
      AND topic0 = '0x987d620f307ff6b94d58743cb7a7509f24071586a77759b77c2d4e29f75a2f9a'
    GROUP BY date
    ORDER BY date DESC
  `, {});

  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false,
  }));
};

const airdropSection: SectionV2 = {
  displayName: "Airdrop",
  methodology: "Community airdrop distributed at TGE based on protocol usage",
  components: [
    {
      id: "retroactive-usage",
      name: "Retroactive Usage",
      methodology: "9% of supply distributed to early users (50% DOLO, 50% veDOLO)",
      fetch: async () => [manualCliff(start, total * 0.09)],
    },
    {
      id: "early-contributors",
      name: "Early Contributors",
      methodology: "1% distributed to early contributors at TGE",
      fetch: async () => [manualCliff(start, total * 0.01)],
    },
    {
      id: "minerals-claimers",
      name: "Minerals Claimers",
      methodology: "10% as call options at $0.045 strike, exercisable for 6 months post-TGE",
      isTBD: true,
      fetch: async () => [manualLinear(start, start + periodToSeconds.months(6), total * 0.10)],
    },
  ],
};

const insidersSection: SectionV2 = {
  displayName: "Insiders",
  methodology: "Team, advisors, and service providers with vesting schedules",
  components: [
    {
      id: "core-team",
      name: "Core Team",
      methodology: "20.2% with 1-year cliff, then 3-year linear vesting",
      fetch: async () => [
        manualLinear(cliffEnd, start + periodToSeconds.years(4), total * 0.202),
      ],
    },
    {
      id: "advisors",
      name: "Advisors",
      methodology: "0.2% with 1-year cliff, then 3-year linear vesting",
      fetch: async () => [
        manualLinear(cliffEnd, start + periodToSeconds.years(4), total * 0.002),
      ],
    },
    {
      id: "service-providers",
      name: "Service Providers",
      methodology: "3% allocation, no specified vesting - modeled as unlocked at TGE",
      isTBD: true,
      fetch: async () => [manualCliff(start, total * 0.03)],
    },
  ],
};

const investorsSection: SectionV2 = {
  displayName: "Investors",
  methodology: "Investor allocations with varying vesting schedules",
  components: [
    {
      id: "short-vest-investors",
      name: "Short Vest Investors",
      methodology: "1.29% vested linearly over 12 months from TGE",
      fetch: async () => [
        manualLinear(start, start + year, total * 0.0129),
      ],
    },
    {
      id: "long-vest-investors",
      name: "Long Vest Investors",
      methodology: "14.91% with 1-year cliff, then 3-year linear vesting",
      fetch: async () => [
        manualLinear(cliffEnd, start + periodToSeconds.years(4), total * 0.1491),
      ],
    },
  ],
};

const incentivesSection: SectionV2 = {
  displayName: "Community Incentives",
  methodology: "Liquidity mining and partner incentives tracked on-chain across Berachain and Arbitrum",
  isIncentive: true,
  components: [
    {
      id: "liquidity-mining-odolo",
      name: "Liquidity Mining - oDOLO (Berachain)",
      methodology: "Tracks oDOLO mints on Berachain via Transfer events from zero address. 20% allocated over ~4 years.",
      isIncentive: true,
      fetch: odoloEmissions,
      metadata: {
        contract: "0x02e513b5b54ee216bf836ceb471507488fc89543",
        chain: "berachain",
        chainId: "80094",
        eventSignature: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      },
    },
    {
      id: "liquidity-mining-oarb",
      name: "Liquidity Mining - oARB (Arbitrum)",
      methodology: "Tracks oARB claimed from Merkle distributor on Arbitrum. Earlier incentive program started Nov 2023.",
      isIncentive: true,
      fetch: oarbEmissions,
      metadata: {
        contract: "0x66cd7d0cc677f42f6662622c60a5e60ef573db67",
        chain: "arbitrum",
        chainId: "42161",
        eventSignature: "0x987d620f307ff6b94d58743cb7a7509f24071586a77759b77c2d4e29f75a2f9a",
      },
    },
    {
      id: "boyco-incentives",
      name: "Boyco Incentives",
      methodology: "3% distributed as veDOLO over 4 years for Royco pre-deposits",
      isIncentive: true,
      fetch: async () => [manualLinear(start, start + periodToSeconds.years(4), total * 0.03)],
    },
    {
      id: "partner-rewards",
      name: "Future Partner Rewards",
      methodology: "5.75% reserved for future partner integrations, no defined schedule",
      isTBD: true,
      fetch: async () => [manualCliff(start, total * 0.0575)],
    },
  ],
};

const noncirculatingSection: SectionV2 = {
  displayName: "Noncirculating",
  methodology: "Foundation and protocol-owned liquidity",
  components: [
    {
      id: "foundation",
      name: "Foundation",
      methodology: "9.65% for long-term ecosystem support, no specified vesting - modeled as held at TGE",
      isTBD: true,
      fetch: async () => [manualCliff(start, total * 0.0965)],
    },
    {
      id: "protocol-owned-liquidity",
      name: "Protocol-Owned Liquidity",
      methodology: "2% seeded on Kodiak & Uniswap at TGE",
      fetch: async () => [manualCliff(start, total * 0.02)],
    },
  ],
};

const dolomite: ProtocolV2 = {
  "Airdrop": airdropSection,
  "Insiders": insidersSection,
  "Investors": investorsSection,
  "Community Incentives": incentivesSection,
  "Noncirculating": noncirculatingSection,

  meta: {
    version: 2,
    token: "coingecko:dolomite",
    sources: [
      "https://docs.dolomite.io/dolo/distribution",
      "https://docs.dolomite.io/dolo/token-mechanics",
    ],
    protocolIds: ["2187"],
    total,
    notes: [
      "All allocations specified as veDOLO or oDOLO are modeled as standard DOLO",
      "oDOLO Liquidity Mining tracks actual mints on Berachain via ClickHouse",
      "oARB Liquidity Mining tracks claimed rewards on Arbitrum via ClickHouse (started Nov 2023)",
      "Boyco Incentives assumed to be unlocked linearly over 4 years",
      "Future Partner Rewards have no defined schedule, modeled as unlocked at start",
      "Minerals Claimers represents tokens available via call options ($0.045 strike) exercisable for 6 months post-TGE",
      "Foundation has no specified vesting schedule, modeled as unlocked at TGE and held by foundation",
      "Service Providers have no specified vesting schedule, modeled as unlocked at TGE",
      "Advisors vesting described as '2-3 years with a 1-year cliff', assumed 1-year cliff + 3 years linear",
      "3% annual inflation starting after Year 4 is not modeled",
    ],
  },

  categories: {
    airdrop: ["Airdrop"],
    insiders: ["Insiders"],
    privateSale: ["Investors"],
    farming: ["Community Incentives"],
    noncirculating: ["Noncirculating"],
  },
};

export default dolomite;
