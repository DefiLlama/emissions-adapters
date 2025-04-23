import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1715817600;
const totalSupply = 1_000_000_000;

// Allocation percentages of total supply
const ecosystem = totalSupply * 0.43;
const airdrop = totalSupply * 0.1;
const protocolDev = totalSupply * 0.25;
const strategicParticipants = totalSupply * 0.22;    

const drift: Protocol = {
  "Initial Airdrop": manualCliff(start, airdrop),

  "Ecosystem Development & Trading Rewards":
    manualLinear(start,
      start + periodToSeconds.months(60),
      ecosystem
    ),
  
  "Strategic Participants":
  manualLinear(
    start + periodToSeconds.months(12),
    start + periodToSeconds.months(60),
    strategicParticipants
  ),

  "Protocol Development":
    manualLinear(
      start + periodToSeconds.months(18),
      start + periodToSeconds.months(36),
      protocolDev
    ),

  meta: {
    token: "solana:DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7",
    sources: ["https://www.drift.trade/governance/introducing-the-drift-governance-token"],
    protocolIds: ["970"],
    notes: [
      "Protocol Development are subject to 18 month lock up and 18 month vesting period based on the documentation",
      "Strategic Participants are assumed to be locked for 12 months and then linearly unlocked, assumption are made based on chart image in the source",
    ]
  },

  categories: {
    insiders: [
      "Protocol Development",
      "Strategic Participants",
    ],
    noncirculating: [
      "Ecosystem Development & Trading Rewards",
    ],
    airdrop: [
      "Initial Airdrop",
    ]
  },
};

export default drift;