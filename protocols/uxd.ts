import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 7000000000;
const start = 1649545200;
const cliff = 1668384000;
const uxd: Protocol = {
  //   Community: [],
  "Seed investors": [
    manualCliff(cliff, qty * 0.143 * 0.25),
    manualStep(cliff, periodToSeconds.month, 36, qty * 0.143 * 0.75 / 36),
  ],
  "Preseed investors": [
    manualCliff(cliff, qty * 0.071 * 0.25),
    manualStep(cliff, periodToSeconds.month, 24, qty * 0.071 * 0.75 / 24),
  ],
  //   Treasury: [],
  "Token sale": manualCliff(start, qty * 0.043),
  Team: [
    manualCliff(cliff, qty * 0.286 * 0.25),
    manualStep(cliff, periodToSeconds.month, 36, qty * 0.286 * 0.75 / 36),
  ],
  meta: {
    sources: ["https://docs.uxd.fi/uxdprotocol/overview/uxp-token-economics"],
    token: "solana:UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M",
    notes: [
      `The source material has some conflicting information.`,
      `Treasury (7.1%) and Community (38.6%) allocations have no given emissions schedule and have therefore been excluded from this analysis.`,
    ],
    protocolIds: ["1402"],
  },
  sections: {
    // farming: ["Community"],
    insiders: ["Seed investors", "Preseed investors", "Team"],
    publicSale: ["Token sale"],
  },
};

export default uxd;
