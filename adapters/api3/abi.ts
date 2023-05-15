export const abi = {
  epochIndexOfLastReward: {
    inputs: [],
    name: "epochIndexOfLastReward",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  epochIndexToReward: {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "epochIndexToReward",
    outputs: [
      { internalType: "uint32", name: "atBlock", type: "uint32" },
      { internalType: "uint224", name: "amount", type: "uint224" },
      { internalType: "uint256", name: "totalSharesThen", type: "uint256" },
      { internalType: "uint256", name: "totalStakeThen", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
};
