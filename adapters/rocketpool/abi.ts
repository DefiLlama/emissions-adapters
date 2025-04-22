export default {
  getAddress: {
    "inputs": [{"type": "bytes32"}],
    "name": "getAddress",
    "outputs": [{"type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  getUint: {
    "inputs": [{"type": "bytes32"}],
    "name": "getUint",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
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
