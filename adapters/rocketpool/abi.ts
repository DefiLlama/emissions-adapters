export default {
  getRewardsClaimersPerc: {
    "inputs": [],
    "name": "getRewardsClaimersPerc",
    "outputs": [
      { "name": "trustedNodePerc", "type": "uint256" },
      { "name": "protocolPerc", "type": "uint256" },
      { "name": "nodePerc", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getInflationIntervalRate: {
    "inputs": [],
    "name": "getInflationIntervalRate",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  getInflationIntervalStartTime: {
    "inputs": [],
    "name": "getInflationIntervalStartTime",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  getInflationIntervalTime: {
    "inputs": [],
    "name": "getInflationIntervalTime",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  totalSupply: {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  getInflationCalcTime: {
    "inputs": [],
    "name": "getInflationCalcTime",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
}
