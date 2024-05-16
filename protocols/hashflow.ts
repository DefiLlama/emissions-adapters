import { manualLinear, manualCliff } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1667779200; // Nov 7, 2022
const totalSupply = 1_000_000_000; // Total HFT Supply

const hashflow: Protocol = {
  "Community Treasury": manualCliff(
    start,
    totalSupply * 0.01, // 1%
  ),
  "Future Hires": manualCliff(
    start,
    totalSupply * 0.025, // 2.5%
  ),
  "Designated Market Maker Loans": manualCliff(
    start,
    totalSupply * 0.075, // 7.5%
  ),
  "Early Integration Partners": manualLinear(
    start,
    start + periodToSeconds.year,
    totalSupply * 0.062, // 6.2%
  ),
  "Future Community Rewards": manualLinear(
    start,
    start + periodToSeconds.year * 4,
    totalSupply * 0.0335, // 3.35%
  ),
  "Vendors and Early Service Providers": manualLinear(
    start,
    start + periodToSeconds.year,
    totalSupply * 0.0252, // 2.52%
  ),
  "Hashverse Rewards": manualLinear(
    start,
    start + periodToSeconds.year * 4,
    totalSupply * 0.01, // 1%
  ),
  "Core Team": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 4,
    totalSupply * 0.1932, // 19.32%
  ),
  "Ecosystem Partners": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 3,
    totalSupply * 0.1854, // 18.54%
  ),
  "Community Rewards": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 3,
    totalSupply * 0.1308, // 13.08%
  ),
  "Early Investors": manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 3,
    totalSupply * 0.25, // 25%
  ),

  meta: {
    token: "ethereum:0xb3999F658C0391d94A37f7FF328F3feC942BcADC",
    sources: [
      "https://docs.hashflow.com/hashflow/hft/allocation-and-distribution",
    ],
    protocolIds: ["1447"],
  },
  categories: {
    insiders: [
      "Core Team",
      "Early Investors",
      "Vendors and Early Service Providers",
      "Early Integration Partners",
    ],
    noncirculating: ["Future Hires", "Community Treasury"],
    farming: [
      "Hashverse Rewards",
      "Future Community Rewards",
      "Community Rewards",
      "Ecosystem Partners",
    ],
    liquidity: ["Designated Market Maker Loans"],
  },
};

export default hashflow;
