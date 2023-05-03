import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1679533271;
const qty = 10000000000;
const qty_advisors = 2694000000;
const qty_investors = 1753000000;
const end_team_investors_1year = 1711155671;

const arbitrum: Protocol = {
  Airdrop: manualCliff(start, qty * 0.1162),
  "Ecosystem Development Fund": manualCliff(start, qty * 0.0113),
  "Arbitrum DAO Treasury": manualCliff(start, qty * 0.4278),
  "Advisors Team OffchainLabs": [
    manualCliff(start + periodToSeconds.year, qty_advisors * 0.25), // 25% cliff after 1 year
    manualStep(
      end_team_investors_1year,
      periodToSeconds.month,
      36,
      qty_advisors * 0.75 / 36,
    ), // monthly steps for the next 3 years
  ],
  Investors: [
    manualCliff(start + periodToSeconds.year, qty_investors * 0.25), // 25% cliff after 1 year
    manualStep(
      end_team_investors_1year,
      periodToSeconds.month,
      36,
      qty_investors * 0.75 / 36,
    ), // monthly steps for the next 3 years
  ],
  meta: {
    token: "arbitrum:0x912ce59144191c1204e64559fe8253a0e49e6548",
    sources: [
      "https://docs.arbitrum.foundation/airdrop-eligibility-distribution#initial-token-allocation--airdrop-distribution",
    ],
    protocolIds: ["2785"],
  },
  sections: {
    insiders: ["Investors", "Advisors Team OffchainLabs"],
    noncirculating: ["Arbitrum DAO Treasury", "Ecosystem Development Fund"],
    airdrop: ["Airdrop"],
  },
};

export default arbitrum;
