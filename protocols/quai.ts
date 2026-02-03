import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds, unixTimestampNow } from "../utils/time";

const initialSupply = 3_000_000_000
const genesisTimestamp = 1738713600 // 2025-02-05
const today = unixTimestampNow()

const foundationSplit = initialSupply * 0.33
const comunityIncentivesSplit = initialSupply * 0.23
const teamSplit = initialSupply * 0.16
const invesmentSplit = initialSupply * 0.14
const developmentSplit = initialSupply * 0.06
const testnetSplit = initialSupply * 0.05
const exchangeLiquiditySplit = initialSupply * 0.02

const fetchMinerRewards = async () : Promise<LinearAdapterResult> => {
    const supply = await fetch("https://rpc.quai.network/mininginfo?Decimal=true").then(response => response.json()).then(data => data.result.quaiSupplyTotal)
    return manualLinear(genesisTimestamp, today, 0)
}

const quai: Protocol = {
  "Foundation": [manualCliff(genesisTimestamp, foundationSplit * 0.02), manualStep(genesisTimestamp + periodToSeconds.months(6), periodToSeconds.month, 66, (foundationSplit * 0.98) / 66)],
  "Community Incentives": [manualCliff(genesisTimestamp, comunityIncentivesSplit * 0.15), manualStep(genesisTimestamp + periodToSeconds.months(6), periodToSeconds.month, 42, (comunityIncentivesSplit * 0.85) / 42)],
  "Team": manualStep(genesisTimestamp + periodToSeconds.year, periodToSeconds.month, 36, teamSplit / 36),
  "Invesment Rounds": [manualCliff(genesisTimestamp, invesmentSplit * 0.25), manualStep(genesisTimestamp + periodToSeconds.year, periodToSeconds.month, 36, (invesmentSplit * 0.75) / 36)],
  "Development Company": [manualCliff(genesisTimestamp, developmentSplit * 0.25), manualStep(genesisTimestamp + periodToSeconds.months(6), periodToSeconds.month, 42, (developmentSplit * 0.75) / 42)],
  "Testnet & Earn program": manualCliff(genesisTimestamp, testnetSplit),
  "Exchange Liquidity": manualCliff(genesisTimestamp, exchangeLiquiditySplit),
  "Mining Rewards": fetchMinerRewards(),
  meta: {
    token: 'coingecko:quai-network',
    sources: [
      "https://docs.qu.ai/learn/tokenomics/quai-emissions",
    ],
    protocolIds: ["parent#quai"],
    chain: "quai",
  },
  categories: {
    farming: ["Community Incentives", "Testnet & Earn program", "Mining Rewards"],
    privateSale: ["Invesment Rounds"],
    insiders: ["Team", "Development Company"],
    liquidity: ["Exchange Liquidity"],
    noncirculating: ["Foundation"],
  },
};
export default quai