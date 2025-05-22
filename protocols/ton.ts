import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const ton: Protocol = {
  Premine: manualLinear("06-07-2020", "28-06-2022", 2665e6, "DD-MM-YYYY"),
  Inflation: manualLinear("28-06-2022", "28-06-2026", 3470400, "DD-MM-YYYY"),
  "TON Believers Fund": manualStep(
    "2025-10-23",
    periodToSeconds.month,
    36,
    1317e6 / 36,
  ),
  "Inactive Miners": manualCliff("2027-02-22", 1081e6),
  meta: {
    sources: [
      "https://ton.org/mining",
      "https://github.com/whiterabbitsolutions/Ton-miners-data-parsing/blob/main/TON_miners_data_parsing.ipynb",
    ],
    notes: [],
    token: "coingecko:the-open-network",
    protocolIds: ["6100"],
    chain: 'ton'
  },
  categories: {
    farming: ["Premine", "Inflation", "Inactive Miners", "TON Believers Fund"],
  },
};
export default ton;
