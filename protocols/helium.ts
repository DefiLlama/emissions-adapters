import { manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const genesisTimestamp = 1564617600;

const yearsAfterGenesis = (years: number) => genesisTimestamp + periodToSeconds.year * years;

function calculateYearlyMinting(year: number): number {
    if (year <= 2) {
        return 103_000_000 / 2;
    }
    let baseAmount = 30_000_000;
    const halvingPeriod = Math.floor((year - 3) / 2);
    const amount = baseAmount / Math.pow(2, halvingPeriod);
    return amount;
}

const totalMintedPerYear: { [year: number]: number } = {};
for (let year = 1; year <= 50; year++) {
    totalMintedPerYear[year] = calculateYearlyMinting(year);
}

function calculatePercentages(year: number) {
    const startingValues = {
        founders: 0.35,
        poc: 0.29,
        data: 0.30,
        consensus: 0.06
    };

    const yearlyChange = year - 1;
    const founders = Math.max(0.15, startingValues.founders - (0.01 * yearlyChange));
    const poc = Math.max(0, startingValues.poc - (0.015 * yearlyChange));
    const data = Math.min(0.79, startingValues.data + (0.025 * yearlyChange));
    const consensus = startingValues.consensus;

    return { poc, data, founders, consensus };
}

const percentages: { [year: number]: { poc: number, data: number, founders: number, consensus: number } } = {};
for (let year = 1; year <= 50; year++) {
    percentages[year] = calculatePercentages(year);
}

const consensusEmissions: any[] = [];
const foundersEmissions: any[] = [];
const pocEmissions: any[] = [];
const dataTransferEmissions: any[] = [];

for (let year = 1; year <= 50; year++) {
    const totalMinted = totalMintedPerYear[year];
    const yearPercents = percentages[Math.min(year, 21)];

    if (!totalMinted || !yearPercents) {
        console.warn(`Missing data for HNT year ${year}`);
        continue;
    }

    const start = yearsAfterGenesis(year - 1);
    const end = yearsAfterGenesis(year);

    const consensusAmount = totalMinted * yearPercents.consensus;
    const foundersAmount = totalMinted * yearPercents.founders;
    const pocAmount = totalMinted * yearPercents.poc;
    const dataTransferAmount = totalMinted * yearPercents.data;

    if (consensusAmount > 0) {
        consensusEmissions.push(manualLinear(start, end, consensusAmount));
    }
    if (foundersAmount > 0) {
        foundersEmissions.push(manualLinear(start, end, foundersAmount));
    }
    if (pocAmount > 0) {
        pocEmissions.push(manualLinear(start, end, pocAmount));
    }
    if (dataTransferAmount > 0) {
        dataTransferEmissions.push(manualLinear(start, end, dataTransferAmount));
    }
}

const helium: Protocol = {
  "Founders and Investors": foundersEmissions,
  "Proof of Coverage": pocEmissions,
  "Data Transfer": dataTransferEmissions,
  "Consensus": consensusEmissions,

  meta: {
    notes: [
      "Schedule based on HIP-20, implementing halvings every 2 years starting from Genesis (Aug 1, 2019).",
      "Emissions are modeled as linear releases over each year.",
      "Percentages for years 21+ are assumed to remain constant as defined in Year 21 due to caps and zeroing out.",
    ],
    sources: ["https://github.com/helium/HIP/blob/main/0020-hnt-max-supply.md"],
    token: "coingecko:helium",
    protocolIds: ["6099"],
  },
  categories: {
    farming: ["Proof of Coverage", "Data Transfer"],
    noncirculating: ["Consensus"],
    insiders: ["Founders and Investors"],
  }
};

export default helium;