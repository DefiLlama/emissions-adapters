import { manualCliff } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const schedules: { [date: string]: { [section: string]: number } } = {
  "2024-01-31": {
    "Airdrop": 1_000_000_000,
    "Launchpool": 250_000_000,
    "Market Makers": 50_000_000,
    "Immediate Needs": 17_300_000,
  },
  "2024-07-06": {
    "LFG Launchpad Fees": 100_000_000,
  },
  "2025-01-22": {
    "Airdrop": 700_000_000,
  },
  "2025-01-31": {
    "Team": 466_666_666.70,
  },
  "2025-02-01": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2025-03-03": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2025-03-26": {
    "DAO": 100_000_000,
  },
  "2025-04-02": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2025-05-02": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2025-06-01": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2025-07-01": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2025-07-31": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2025-08-30": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2025-09-29": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2025-10-29": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2025-11-28": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2025-12-28": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2026-01-27": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2026-02-26": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2026-02-28": {
    "Airdrop": 200_000_000,
  },
  "2026-03-28": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2026-04-27": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2026-05-27": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2026-06-26": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2026-07-26": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2026-08-25": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2026-09-24": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2026-10-24": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2026-11-23": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2026-12-23": {
    "Team": 38_888_888.89,
    "Mercurial Stakeholders": 14_583_333.33,
  },
  "2027-01-31": {
    "Airdrop": 200_000_000,
  },
};

const jupiter: Protocol = {
  meta: {
    notes: [
      "Data provided by Jupiter team.",
      "Burns not modeled (3B supply reduction, litterbox burns, verification burns).",
      "Jupnet Incentives (300M) excluded - release time TBD.",
    ],
    token: "coingecko:jupiter-exchange-solana",
    sources: ["https://www.jupresear.ch/t/jup-the-genesis-post/478"],
    protocolIds: ["2141", "4077"],
    total: 10e9,
  },
  categories: {
    airdrop: ["Airdrop"],
    publicSale: ["Launchpool"],
    liquidity: ["Market Makers", "Immediate Needs"],
    noncirculating: ["DAO", "LFG Launchpad Fees"],
    insiders: ["Team", "Mercurial Stakeholders"],
  },
};

Object.keys(schedules).forEach((date: string) => {
  Object.keys(schedules[date]).forEach((section: string) => {
    if (!jupiter[section]) {
      jupiter[section] = [];
    }
    (jupiter[section] as any[]).push(manualCliff(date, schedules[date][section]));
  });
});

export default jupiter;
