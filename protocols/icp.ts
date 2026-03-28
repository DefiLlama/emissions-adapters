import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds, unixTimestampNow, years } from "../utils/time";

const genesis = 1620604800; // 2021-05-10
const seedStart = 1485907200; // 2017-02-01
const now = unixTimestampNow()
const genesisSupply = 469_213_709;
const supplySeriesStart = 1635292800; // first data point from API

const networkRewards = async (): Promise<CliffAdapterResult[]> => {
  const res = await fetch(
    `https://ic-api.internetcomputer.org/api/v3/governance-metrics/governance_total_supply_icp?start=${supplySeriesStart}&end=${now}&step=86400`,
  );
  const data = await res.json();
  const values: [number, string][] =
    data.governance_total_supply_icp[0].values;
  const results: CliffAdapterResult[] = [];
  for (let i = 1; i < values.length; i++) {
    const delta = Number(values[i][1]) - Number(values[i - 1][1]);
    if (delta !== 0) {
      results.push({ type: "cliff", start: values[i][0], amount: delta });
    }
  }
  return results;
};

const icp: Protocol = {
  "Seed Round": manualLinear(
    seedStart,
    years(seedStart, 4),
    115986694,
  ),
  "Early Contributors": manualStep(genesis, periodToSeconds.month, 1, 44575228),
  "Strategic Round": manualStep(
    genesis,
    periodToSeconds.month,
    36,
    32845140 / 36,
  ),
  Presale: manualStep(
    genesis + periodToSeconds.month,
    periodToSeconds.month,
    12,
    23295828 / 12,
  ),
  "Community Airdrop": manualStep(
    genesis,
    periodToSeconds.month,
    12,
    6005627 / 12,
  ),
  "Foundation, Team & Partnerships": manualStep(
    genesis,
    periodToSeconds.month,
    1,
    246505192,
  ),
  "Network Rewards": [
    // gap: rewards minted between genesis and first total supply data point
    manualCliff(supplySeriesStart, 474_132_538 - genesisSupply),
    networkRewards,
  ],
  meta: {
    token: `coingecko:internet-computer`,
    sources: [
      "https://messari.io/report/an-introduction-to-dfinity-and-the-internet-computer",
      "https://medium.com/dfinity/announcing-the-dfinity-presale-fundraise-and-public-airdrop-cdea19892ef6",
      "https://ic-api.internetcomputer.org",
    ],
    notes: [
      "There's no vesting schedule for the Foundation, Team & Partnerships allocation, so we've assumed it was unlocked at genesis",
      "Network Rewards includes voting rewards, node provider rewards, and burns (net supply change)",
    ],
    protocolIds: ["4618"],
  },
  categories: {
    publicSale: ["Seed Round"],
    airdrop: ["Community Airdrop"],
    privateSale: ["Strategic Round", "Presale"],
    insiders: ["Early Contributors", "Foundation, Team & Partnerships"],
    staking: ["Network Rewards"],
  },
};

export default icp;
