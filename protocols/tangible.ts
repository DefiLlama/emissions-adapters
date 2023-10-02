import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 33333333;
const start = 0;

const tangible: Protocol = {
  "Instant Liquidity Engine": manualCliff(start, qty * 0.0038),
  "Listings & Liquidity": manualCliff(start, qty * 0.0027),
  "Pre Seed & Advisors": manualCliff(
    start + periodToSeconds.year * 4,
    qty * 0.0481,
  ),
  Team: manualCliff(start + periodToSeconds.year * 4, qty * 0.1187),
  IDO: manualCliff(start + periodToSeconds.year * 4, qty * 0.0125),
  "Tangible Labs": manualCliff(start + periodToSeconds.year * 4, qty * 0.0958),
  Bounty: manualCliff(start + periodToSeconds.year * 4, qty * 0.0021),
  DAO: manualCliff(start + periodToSeconds.year * 2, qty * 0.0615),
  "GURU Holders": manualLinear(
    start + periodToSeconds.year * 2,
    start + periodToSeconds.year * 4,
    qty * 0.6548,
  ),
  meta: {
    sources: [
      "https://docs.tangible.store/tngbl-and-marketplace/tangible-token-tngbl",
    ],
    notes: [
      `"GURU Holders" allocation consists of a mix of 2-4 year staked NFT positions. The mix is unkown so here we have assumed they'll unlock linearly across the 2 year period.`,
    ],
    token: "polygon:0x49e6A20f1BBdfEeC2a8222E052000BbB14EE6007",
    protocolIds: ["2231"],
  },
  categories: {},
};

export default tangible;
