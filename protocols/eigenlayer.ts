import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1715299260; // 10/05/2024
const total = 1.67e9;     // Total Supply: 1.67 billion tokens
const token = null; 
const chain = "ethereum";   

const eigen: Protocol = {
  "Airdrop/Stakedrop": [
    manualCliff(start, total * 0.05),
    manualStep(start + periodToSeconds.month * 3, periodToSeconds.month, 6, (total * 0.1) / 6), //assuming 6 
  ],
  "Community Initiatives": manualCliff(start + periodToSeconds.year, total * 0.15), //no idea about durations here, assuming unlock after 1 year
  "Ecosystem": manualCliff(start + periodToSeconds.year, total * 0.15), //no idea about durations here, assuming unlock after 1 year
  "Investors": [
    manualCliff(start + periodToSeconds.year, total * 0.295 / 4),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      (total * 0.295 * 3) / 4,
    ),
  ],
  "Early Contributors": [
    manualCliff(start + periodToSeconds.year, total * 0.255 / 4),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(3),
      (total * 0.255 * 3) / 4,
    ),
  ],
  meta: {
    token: `${chain}:${token}`,
    sources: ["https://docs.eigenfoundation.org/"],
    protocolIds: ["3107"],
  },
  categories: {
    publicSale: ["Airdrop/Stakedrop"],
    insiders: ["Investors", "Early Contributors"],
    noncirculating: ["Community Initiatives", "Ecosystem"],
  },
};

export default eigen;
