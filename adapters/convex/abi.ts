const abi: { [key: string]: object } = {
  poolLength: {
    inputs: [],
    name: "poolLength",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  poolInfo: {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "poolInfo",
    outputs: [
      { internalType: "address", name: "lptoken", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "gauge", type: "address" },
      { internalType: "address", name: "crvRewards", type: "address" },
      { internalType: "address", name: "stash", type: "address" },
      { internalType: "bool", name: "shutdown", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  minted: {
    name: "minted",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "address", name: "arg0" },
      { type: "address", name: "arg1" },
    ],
    stateMutability: "view",
    type: "function",
  },
};
export default abi;
