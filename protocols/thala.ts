import { manualCliff, manualLinear, manualLog } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const qty = 100_000_000;
const start = 1680746400;
const start_vesting = 1696557600



const thala: Protocol = {
    "Token Generation Event": manualCliff(start, qty * 0.1),
    "Treasury": manualLinear(start, start + periodToSeconds.year * 5, 15_000_000),
    "Community Incentive":manualLinear(start, start + periodToSeconds.year * 6, 35_000_000),
    "Team & Advisors":manualLinear(start_vesting, start_vesting + periodToSeconds.month * 30, 20_000_000),
    "Investors":manualLinear(start_vesting, start_vesting + periodToSeconds.month * 30, 20_000_000),
  notes: [],
  token: "aptos:0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615",
  sources: ["https://docs.thala.fi/thala-protocol-design/thl-governance-token/tokenomics/distribution"],
  protocolIds: ["2789"],
};

export default thala;