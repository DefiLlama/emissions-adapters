import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol, AdapterResult } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start: number = 0;
const qty: number = 100e6;

const equilibria: Protocol = {
  Airdrop: [], // 2%
  "Boostrapping Incentives": manualCliff(
    start + periodToSeconds.month * 6,
    qty * 0.02,
  ),
  "Pendle LP Incentives": [], // 45% based on PENDLE gained like CVX
  "Liquidity Mining": [],
  "Equilibria Treasury": [],
  "Team & Advisors": [],
  "Presale Investors": [],
  IDO: [],

  meta: {
    sources: ["https://docs.equilibria.fi/token/eqb/tokenomics"],
    token: "arbitrum:0xbfbcfe8873fe28dfa25f1099282b088d52bbad9c",
    protocolIds: ["3091"],
  },
  categories: {},
};
export default equilibria;
