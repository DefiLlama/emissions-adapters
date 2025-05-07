import { Protocol } from "../types/adapters";
import { manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1694736000;
const totalSupply = 120_000_000;

const coreContributors = totalSupply * 0.188;
const community = totalSupply * 0.44;
const investors = totalSupply * 0.143;
const ecosystem = totalSupply * 0.229;

const vana: Protocol = {
  "Community": [
    manualCliff(start, community * 0.203),
    manualStep(
      start,
      periodToSeconds.month,
      36,
      (community * 0.797) / 36,
    ),
  ],
  "Ecosystem": [
    manualCliff(start, ecosystem * 0.048),
    manualStep(
      start,
      periodToSeconds.month,
      48,
      (ecosystem * 0.952) / 48,
    ),
  ],
  "Core Contributors": [
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      48,
      coreContributors / 48,
    ),
  ],
  "Investors": [
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      36,
      investors / 36,
    ),
  ],

  
  meta: {
    token: "coingecko:vana",
    sources: ["https://docs.vana.org/docs/vana-token-overview"],
    protocolIds: ["6145"],
    notes: [
      "We assume that community and ecosystem are unlocked over 36 months and 48 months respectively, as the unlock schedule is not clearly defined in the source.",
    ]
  },

  categories: {
    insiders: ["Team"],
    privateSale: ["Investors"],
    noncirculating: ["Ecosystem", "Community"],
  }
};

export default vana;
