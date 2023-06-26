const abi: { [method: string]: object } = {
  userReward: {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "userReward",
    outputs: [
      { internalType: "uint128", name: "index", type: "uint128" },
      { internalType: "uint128", name: "accrued", type: "uint128" },
    ],
    stateMutability: "view",
    type: "function",
  },
};

export default abi;
