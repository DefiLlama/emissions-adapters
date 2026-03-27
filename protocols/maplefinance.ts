import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const start = 1726099200; // 2024-09-12
const totalSupply = 1_000_000_000;

const shares =  {
  teamAdvisor: totalSupply * 0.25,
  seed: totalSupply * 0.26,
  publicSale: totalSupply * 0.05,
  liquidityMining: totalSupply * 0.30
}

const treasuryMigration = 140_000_000
const mip009Issuance = 100_000_000
const mip009Historical = 54_930_000
const mip009Future = 73_810_000 // MIP-009 continuing 5% annual emissions
const mip009FutureEnd = 1788220800; // 2026-09-01

const maplefinance: Protocol = {
  "Public Sale": manualCliff(start, shares.publicSale),
  "Team and Advisors": manualCliff(start, shares.teamAdvisor),
  "Seed Investors": manualCliff(start, shares.seed),
  "Liquidity Mining": manualCliff(start, shares.liquidityMining),
  "Treasury": [
    manualCliff(start, treasuryMigration),
    manualCliff(start, mip009Issuance),
    manualCliff(start, mip009Historical),
    manualLinear(start, mip009FutureEnd, mip009Future),
  ],
  meta: {
    token: "ethereum:0x643c4e15d7d62ad0abec4a9bd4b001aa3ef52d66",
    sources: [
      "https://content.forgd.com/p/tokenomics-101-maple-finance",
      "https://docs.maple.finance/maple-for-token-holders/syrup-tokenomics",
      "https://docs.maple.finance/maple-for-token-holders/mpl-token/mpl-token-migration",
    ],
    protocolIds: ["parent#maple-finance"],
    notes: [
      "All allocations are based on the original MPL tokenomics. MPL supply of 10M converts to 1B SYRUP.",
      "MPL to SYRUP conversion ended May 21, 2025.",
      "Treasury includes: 140M original migration, 100M MIP-009 recapitalization, 54.93M historical emissions (Sept 2023 - Oct 2024), and 73.81M future emissions (Oct 2024 - Sept 2026).",
    ],
  },

  categories: {
    noncirculating: ["Treasury"],
    publicSale: ["Public Sale"],
    farming: ["Liquidity Mining"],
    privateSale: ["Seed Investors"],
    insiders: ["Team and Advisors"],
  },
};

export default maplefinance;
