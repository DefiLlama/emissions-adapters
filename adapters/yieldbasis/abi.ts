const abi = {
  // VestingEscrow
  START_TIME: "function START_TIME() external view returns (uint256)",
  END_TIME: "function END_TIME() external view returns (uint256)",
  initial_locked_supply: "function initial_locked_supply() external view returns (uint256)",
  vestedSupply: "function vestedSupply() external view returns (uint256)",
  lockedSupply: "function lockedSupply() external view returns (uint256)",

  // GaugeController
  n_gauges: "function n_gauges() external view returns (uint256)",
  gauges: "function gauges(uint256) external view returns (address)",
  preview_emissions: "function preview_emissions(address gauge, uint256 at_time) external view returns (uint256)",
  weighted_emissions_per_gauge: "function weighted_emissions_per_gauge(address) external view returns (uint256)",
  sent_emissions_per_gauge: "function sent_emissions_per_gauge(address) external view returns (uint256)",

  // GovernanceToken (YB)
  preview_emissions_token: "function preview_emissions(uint256 t, uint256 rate_factor) external view returns (uint256)",
};

export default abi;
