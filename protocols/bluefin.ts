import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1733875200; // Current timestamp used as placeholder for TGE
const total = 1_000_000_000; // Total supply: 1B BLUE tokens

const bluefin: Protocol = {
  "Liquidity Reserve": [
    manualCliff(start, total * 0.045), // Fully unlocked at TGE
  ],

  Treasury: [
    manualLinear(
      start + periodToSeconds.months(3), // 3-month cliff
      start + periodToSeconds.months(39), // 36-month vesting
      total * 0.065,
    ),
  ],

  "Protocol Development": [
    manualCliff(start, total * 0.0283), // ⅓ at TGE
    manualLinear(
      start,
      start + periodToSeconds.years(2),
      total * 0.0567, // ⅔ over 2 years
    ),
  ],

  "Strategic Participants": [
    manualLinear(
      start + periodToSeconds.year, // 1-year cliff
      start + periodToSeconds.years(3), // 24-month linear unlock after cliff
      total * 0.28,
    ),
  ],

  "Core Contributors": [
    manualLinear(
      start + periodToSeconds.year, // 1-year cliff
      start + periodToSeconds.years(3), // 24-month linear unlock after cliff
      total * 0.2,
    ),
  ],

  "User Incentives": [
    // Airdrop portion (19.68%) with initial unlock and 2-month linear for remainder
    manualCliff(start, total * 0.0984), // 50% of airdrop at TGE
    manualLinear(
      start,
      start + periodToSeconds.months(2),
      total * 0.0984, // Remaining 50% over 2 months
    ),
    // Post-launch incentives (12.82%) over 5 years
    manualLinear(start, start + periodToSeconds.years(5), total * 0.1282),
  ],

  meta: {
    notes: [
      "For user incentives we assumed 50% of the airdrop is unlocked at TGE and the rest is linearly vested over 2 months.",
      "The post-launch incentives (trading rewards) are assumed to be linearly vested over 5 years.",
    ],
    sources: ["https://bluefin.io/foundation/token"],
    token: "sui:0xe1b45a0e641b9955a20aa0ad1c1f4ad86aad8afb07296d4085e349a50e90bdca",
    protocolIds: ["parent#bluefin"],
  },

  categories: {
    insiders: ["Core Contributors", "Strategic Participants"],
    noncirculating: ["Protocol Development", "Treasury"],
    farming: ["User Incentives"],
  },
};

export default bluefin;
