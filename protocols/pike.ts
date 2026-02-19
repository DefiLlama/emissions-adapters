import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start: number = 1727715600;
const total: number = 2_140_000_000;

const vesting = (
  total: number,
  initialProportion: number,
  cliffMonths: number,
  length: number,
) => [
  manualCliff(start, total * initialProportion),
  manualStep(
    start + periodToSeconds.months(cliffMonths),
    periodToSeconds.month,
    length,
    (total * (1 - initialProportion)) / length,
  ),
];
const pike: Protocol = {
  "Foundation Treasury": vesting(total * 0.22, 0.5, 3, 6),
  "Core Contributors": vesting(total * 0.1, 0, 12, 36),
  Advisors: vesting(total * 0.05, 0.25, 6, 12),
  "Strategic Partners & Ecosystem": vesting(total * 0.08, 0.5, 6, 6),
  "Liquidity Incentives": vesting(total * 0.15, 0, 2, 36),
  "Staking Incentives": vesting(total * 0.2, 0, 3, 36),
  "Community and Launch": vesting(total * 0.15, 0, 3, 36),
  "Community Treasury": vesting(total * 0.05, 0.1, 3, 12),
  meta: {
    sources: [
      "https://mirror.xyz/pikedao.eth/BywvDZ5xA37T4m_OBktR4HfX6Hq5okKkRk_AWvxQJ_0",
    ],
    token: "coingecko:pike-finance",
    protocolIds: ["4100"],
  },
  categories: {
    insiders: ["Foundation Treasury", "Core Contributors", "Advisors"],
    farming: [
      "Liquidity Incentives",
      "Community and Launch",
    ],
    staking: ["Staking Incentives"],
    noncirculating: ["Strategic Partners & Ecosystem", "Community Treasury"],
  },
};
export default pike;
