import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1733788800; // December 10, 2024
const totalSupply = 1_000_000_000;

// Allocation amounts
const initialClaim = totalSupply * 0.125;
const communityEcosystem = totalSupply * 0.384;
const contributors = totalSupply * 0.236;
const strategicParticipants = totalSupply * 0.255;

const magiceden: Protocol = {
  "Initial ME Claim": manualCliff(start, initialClaim),
  "Community & Ecosystem":
    manualLinear(start, start + periodToSeconds.years(4), communityEcosystem),
  "Contributors": [
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      contributors * 0.4
    ),
    manualLinear(
      start + periodToSeconds.months(18),
      start + periodToSeconds.years(4),
      contributors * 0.6
    )
  ],
  "Strategic Participants": [
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(4),
      strategicParticipants
    )
  ],


  meta: {
    token: "coingecko:magic-eden",
    sources: ["https://blog.mefoundation.com/blog/me-tokenomics/"],
    protocolIds: ["6028"],
    notes: [
      "Assuming Core Contributors (60% of contributors) lock for 18 months after TGE",
      "Assuming all Strategic Participants lock for 1 year after TGE",
    ]
  },

  categories: {
    insiders: [
      "Contributors",
      "Strategic Participants",
    ],
    noncirculating: [
      "Community & Ecosystem",
    ],
    airdrop: ["Initial ME Claim"],
  },
};

export default magiceden;
