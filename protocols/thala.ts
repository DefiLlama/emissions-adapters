import { manualCliff, manualLinear, manualLog } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const qty = 100000000;
const start = 1680746400;
const start_vesting = 1696557600;

const thala: Protocol = {
  "Token Generation Event": manualCliff(start, qty * 0.1),
  Treasury: [
    manualCliff(start, qty * 0.03),
    manualLinear(start, start + periodToSeconds.year * 5, qty * 0.12),
  ],
  "Community Incentive": manualLog(
    start,
    start + periodToSeconds.year * 15,
    35000000,
    periodToSeconds.week,
    0.6,
  ),
  "Team & Advisors": manualLinear(
    start_vesting,
    start_vesting + periodToSeconds.month * 24,
    qty * 0.2,
  ),
  Investors: manualLinear(
    start_vesting,
    start_vesting + periodToSeconds.month * 24,
    qty * 0.2,
  ),
  meta: {
    notes: [
      `Community incentives (35%) emission schedule has been estimated with respect to the chart shown in the supply schedule source.`,
    ],
    token:
      "aptos:0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615",
    sources: [
      "https://docs.thala.fi/thala-protocol-design/thl-governance-token/tokenomics/distribution",
      "https://docs.thala.fi/thala-protocol-design/thl-governance-token/tokenomics/supply-schedule",
    ],
    protocolIds: ["2789"],
  },
  sections: {
    noncirculating: ["Treasury"],
    publicSale: ["Token Generation Event"],
    farming: ["Community Incentive"],
    insiders: ["Team & Advisors", "Investors"],
  },
};

export default thala;
