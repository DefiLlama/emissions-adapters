const abi = {
  factoryAbi: {
    LogVestingStarted: "event LogVestingStarted(address indexed recipient, address indexed vesting, address owner, uint256 amount)",
  },
  vestingContractAbi: {
    vestingBegin: "function vestingBegin() external view returns (uint32)",
    vestingCliff: "function vestingCliff() external view returns (uint32)",
    vestingEnd: "function vestingEnd() external view returns (uint32)",
    vestingAmount: "function vestingAmount() external view returns (uint256)"
  }
};

export default abi;
