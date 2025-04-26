import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, LinearAdapterResult, Protocol } from "../types/adapters";
import { GAS_TOKEN } from "../utils/constants";
import { queryDune } from "../utils/dune";
import { periodToSeconds } from "../utils/time";

const chain = "ethereum";
const start = 1438300800;

const genesis = 1438269988; // block 1 5eth reward
const byzantiumFork = 1508131331; // block 4370000 3eth reward
const constantinopleFork = 1551383524; // block 7280000 2eth reward
const merge = 1663224162; // block 15537393 0eth reward 

interface BurnDataPoint {
  eth_burn: number;
  timestamp: number;
}

const burnData = async (type: 'pos' | 'pow'): Promise<LinearAdapterResult[]> => {
  const result: LinearAdapterResult[] = [];
  const burnData = await queryDune("5041563")
 
  // Filter data based on type
  let filteredData = burnData;
  if (type === 'pow') {
    // Pre-merge data
    filteredData = burnData.filter((d: BurnDataPoint) => d.timestamp < merge);
  } else if (type === 'pos') {
    // Post-merge data
    filteredData = burnData.filter((d: BurnDataPoint) => d.timestamp >= merge);
  }

  for (let i = 0; i < filteredData.length - 1; i++) {
    result.push({
      type: "linear",
      start: filteredData[i + 1].timestamp,
      end: filteredData[i].timestamp,
      amount: -filteredData[i].eth_burn
    });
  }

  return result;
}

const foundationOutflow = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const foundationOutflowData = await queryDune("5041975")
  for (let i = 0; i < foundationOutflowData.length; i++) {
    result.push({
      type: "cliff",
      start: foundationOutflowData[i].start,
      amount: foundationOutflowData[i].amount,
    })
  }

  return result;
}

const stakingRewards = async (): Promise<LinearAdapterResult[]> => {
  const result: LinearAdapterResult[] = [];
  const issuanceData = await queryDune("5041721")

  for (let i = 0; i < issuanceData.length - 1; i++) {
    result.push({
      type: "linear",
      start: issuanceData[i + 1].timestamp,
      end: issuanceData[i].timestamp,
      amount: issuanceData[i].eth_issued
    })
  }
  return result;
}


const ethereum: Protocol = {
  "Crowd Sale": manualCliff(start, 6e7),
  "Early Contributors": manualLinear(
    start,
    start + periodToSeconds.year * 4,
    6e6,
  ),
  "Ethereum Foundation": foundationOutflow,
  "Issuance": [
    manualLinear(genesis, byzantiumFork, 4369999 * 5),
    manualLinear(byzantiumFork, constantinopleFork, 2910000 * 3),
    manualLinear(constantinopleFork, merge, 8257393 * 2),
    stakingRewards,
    burnData
  ],
  meta: {
    token: `${chain}:${GAS_TOKEN}`,
    notes: [
      `Information on the Early Contributor vesting schedule structure could not be found, here we have assumed it as linearly unlocked over 4 years.`,
      `The Ethereum Foundation supply is assumed to be unlocked when there's an outflow from EthDev address.`,
      `Issuance is combination of PoW and PoS issuance, with EIP-1559 burning included`,
      `Uncle Block rewards are not included in the issuance calculation.`,
    ],
    sources: [
      "https://dune.com/21co/ethereum-key-metrics",
      "https://www.galaxy.com/insights/research/breakdown-of-ethereum-supply-distribution-since-genesis/",
      "https://fastercapital.com/topics/common-token-vesting-strategies-for-airdrop-cryptocurrency.html",
    ],
    protocolIds: ["4488"],
  },
  categories: {
    farming: ["Issuance"],
    insiders: ["Ethereum Foundation"],
    publicSale: ["Crowd Sale"],
  },
};
export default ethereum;
