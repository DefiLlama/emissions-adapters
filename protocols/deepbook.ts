import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1728864000; // October 14, 2024
const totalSupply = 10_000_000_000;

const initialCommunityAirdrop = totalSupply * 0.10;
const coreContributorsAndBackers = totalSupply * 0.2843;
const ecosystemGrowth = totalSupply * 0.6157;

const deepbook: Protocol = {
  "Initial Community Airdrop": manualCliff(start, initialCommunityAirdrop),

  "Core Contributors and Early Backers": [
    manualCliff(start, coreContributorsAndBackers * 0.01), // 1% unlocked at TGE
    manualLinear(
      start + periodToSeconds.year, 
      start + periodToSeconds.years(4),
      coreContributorsAndBackers * 0.99
    )
  ],

  "Ecosystem Growth": [
    manualCliff(start, ecosystemGrowth * 0.14), // 14% unlocked at TGE
    manualLinear(
      start,
      start + periodToSeconds.years(7), 
      ecosystemGrowth * 0.86
    )
  ],

  meta: {
    token: "sui:0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
    sources: ["https://deepbook.tech/deep-token"],
    protocolIds: ["3268"],
    notes: ["There's no exact allocation between Core Contributors and Early Backers, therefore it's assumed that 1% is unlocked at TGE and the rest is unlocked linearly over 3 years after a 1 year cliff."],
  },

  categories: {
    insiders: [
      "Core Contributors and Early Backers"
    ],
    noncirculating: [
      "Ecosystem Growth"
    ],
    airdrop: [
      "Initial Community Airdrop"
    ],
  },
};

export default deepbook;