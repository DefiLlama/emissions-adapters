import { manualCliff } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import adapter from "../adapters/aura/aura";
import auraBalAdapter from "../adapters/aura/auraBal";
import masterchef from "../adapters/sushi/sushi";

const maxSupply = 100_000_000;

const aura: Protocol = async () => {
  const treasury = adapter(
    "0x43B17088503F4CE1AED9fB302ED6BB51aD6694Fa",
    "ethereum",
    maxSupply * 0.175,
  );
  const balancer = adapter(
    "0xFd72170339AC6d7bdda09D1eACA346B21a30D422",
    "ethereum",
    maxSupply * 0.02,
  );
  const auraBalRewards = auraBalAdapter(
    "0xC47162863a12227E5c3B0860715F9cF721651C0c",
    "ethereum",
    maxSupply * 0.1,
  );
  const auraMasterchef = masterchef(
    "0x1ab80f7fb46b25b7e0b2cfac23fc88ac37aaf4e9",
    "ethereum",
  );
  return {
    "lp rewards": auraMasterchef,
    treasury,
    "auraBAL rewards": auraBalRewards,
    "Balancer treasury": balancer,
    team: [], //
    AURA: [],
    "launch incentives": [],
    "future incentives": manualCliff(1670500408, 1_000_000), // 0x1a661CF8D8cd69dD2A423F3626A461A24280a8fB
    sources: ["https://docs.aura.finance/aura/usdaura/distribution"],
    token: "ethereum:0xc0c293ce456ff0ed870add98a0828dd4d2903dbf",
    protocolIds: ["1918"],
  };
}
export default aura;
// hard to identify:
// 0x45025ebc38647bcf7edd2b40cfdaf3fbfe1538f5
// 0x2AE1Ee55dfaDAC71EF5F25f093D2f24Fe58961f1
// 0x5bd3fCA8D3d8c94a6419d85E0a76ec8Da52d836a
