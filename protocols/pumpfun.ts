import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1752325200;
const total = 1000e9;

const pumpfun: Protocol = {
  "Initial Coin Offering": manualCliff(start, total * 0.33),
  Livestreaming: manualCliff(start, total * 0.03),
  "Liquidity & Exchanges": manualCliff(start, total * 0.026),
  "Ecosystem Fund": manualCliff(start, total * 0.024),
  Foundation: manualCliff(start, total * 0.02),
  "Community & Ecosystem": [
    manualCliff(start, total * 0.24 * 0.5),
    manualStep(start, periodToSeconds.month, 12, (total * 0.24 * 0.5) / 12),
  ],
  Team: manualStep(start + periodToSeconds.year, periodToSeconds.month, 36, (total * 0.20) / 36),
  "Existing Investors": manualStep(start + periodToSeconds.year, periodToSeconds.month, 36, (total * 0.13) / 36),
  
  meta: {
    token: "coingecko:pump-fun",
    sources: ["https://token.pump.fun/tokenomics"],
    protocolIds: ["parent#pump"],
    total,
  },
  categories: {
    publicSale: ["Initial Coin Offering"],
    farming: ["Community & Ecosystem", "Livestreaming", "Ecosystem Fund"],
    insiders: ["Team", "Existing Investors", "Foundation"],
    liquidity: ["Liquidity & Exchanges"],
  },
};

export default pumpfun;
