import { manualCliff, manualLog, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { months, periodToSeconds, years } from "../utils/time";

const start = 1718841600; // 2024-06-20
const total = 1_000_000_000;
const quarter = periodToSeconds.months(3);

const shares = {
  megadrop: total * 0.10,
  airdrop: total * 0.10,
  investors: total * 0.19,
  team: total * 0.035,
  community: total * 0.40,
  treasury: total * 0.08,
  ecosystem: total * 0.095,
};

const listadao: Protocol = {
  "Binance Megadrop": manualCliff(start, shares.megadrop),
  "Airdrop": [manualCliff(start, shares.airdrop * 0.85), manualCliff(start + periodToSeconds.year, shares.airdrop * 0.15)],
  "DAO Treasury": manualStep(months(start, 3), quarter, 16, shares.treasury / 16),
  "Ecosystem Incentives": [
    manualCliff(start, total * 0.035),
    manualStep(months(start, 3), quarter, 3, 3_125_000),
    manualStep(years(start, 1), quarter, 13, 3_750_000),
    manualStep(years(start, 4) + periodToSeconds.months(3), quarter, 3, 625_000),
  ],
  "Investors & Advisors": [manualCliff(start, total * 0.01), manualStep(years(start, 1), quarter, 8, (shares.investors - total * 0.01) / 8)],
  "Team": manualStep(years(start, 1), quarter, 16, shares.team / 16),
  "Community": [manualLog(start, years(start, 20), shares.community, periodToSeconds.day * 365, (1 - 1 / Math.sqrt(2)) * 100)],
  meta: {
    notes: [
      "Community emissions follow a geometric series with ratio 1/√2 per year for 20 years.",
      "Ecosystem Incentives quarterly unlocks follow a tiered schedule per the official documentation.",
    ],
    token: "coingecko:lista",
    sources: [
      "https://docs.lista.org/governance-and-tokenomics/lista-distribution",
    ],
    protocolIds: ["parent#lista-dao"],
    total,
  },
  categories: {
    publicSale: ["Binance Megadrop"],
    insiders: ["Team", "Investors & Advisors"],
    airdrop: ["Airdrop"],
    farming: ["Community", "Ecosystem Incentives"],
    noncirculating: ["DAO Treasury"],
  },
};
export default listadao;
