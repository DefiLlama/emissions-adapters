import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1729123200;
const totalSupply = 1_000_000_000;

// Allocation amounts
const community = totalSupply * 0.4;
const buildersPartner = totalSupply * 0.25;
const privateSale = totalSupply * 0.2125;
const team = totalSupply * 0.0875;
const treasury = totalSupply * 0.05;


const uxlink: Protocol = {
    "Community": manualCliff(start, community),
    "Builders & Partners": manualCliff(start, buildersPartner),
    "Treasury": manualCliff(start, treasury),
    "Partners": manualLinear(
        start + periodToSeconds.months(6),
        start + periodToSeconds.months(30),
        privateSale,
    ),
    "Team": manualLinear(
        start + periodToSeconds.months(9),
        start + periodToSeconds.months(33),
        team,
    ),
  
  meta: {
    token: "arbitrum:0x1a6b3a62391eccaaa992ade44cd4afe6bec8cff1",
    sources: ["https://docs.uxlink.io/layer/whitepaper/white-paper"],
    protocolIds: ["6040"],
    notes: [
      "Due to uncertainty in the description whether it's unlocked 24 months linear or 21 months quarterly release, we assume it's linear",
      "Due to treasury being flexible we assume it's unlocked at TGE",
      "We split 65% community to 40% users and 25% builders & partners",
    ]
  },

  categories: {
    insiders: [
      "Builders & Partners",
      "Partners",
      "Team"
    ],
    noncirculating: [
      "Treasury",
    ],
  },
};

export default uxlink;