import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import type { Protocol } from "../types/adapters";

const launch = 1689972929; // 21 July 2023 8:55:29 PM
const vestingStart = 1717200000; // 01 June 2024 00:00:00 AM
const end = vestingStart + periodToSeconds.year * 4;

const total = 10_000_000;

const team = total * 0.314;
const airdrop = total * 0.01;
const incident = total * 0.1;
const treasury = total * 0.1;
const investors = total * 0.136;
const community = total * 0.45 - incident - airdrop;

const exactly: Protocol = {
  "DAO Treasury": manualCliff(launch, treasury),
  Airdrop: manualLinear(launch, launch + periodToSeconds.month * 4, airdrop),
  Community: manualLinear(launch, end, community),
  "Incident Compensation": manualLinear(vestingStart, end, incident),
  Investors: manualLinear(vestingStart, end, investors),
  "Team and Advisors": manualLinear(vestingStart, end, team),
  meta: {
    token: "optimism:0x1e925De1c68ef83bD98eE3E130eF14a50309C01B",
    sources: [
      "https://docs.exact.ly/governance/exactly-token-exa",
      "https://x.com/ExactlyProtocol/status/1681380822304149504",
      "https://medium.com/@exactly_protocol/the-exa-token-is-here-88a2449c4eb3",
    ],
    protocolIds: ["exactly"],
  },
  categories: {
    airdrop: ["Airdrop"],
    insiders: ["Team and Advisors", "Investors"],
    noncirculating: ["DAO Treasury"],
  },
};

export default exactly;
