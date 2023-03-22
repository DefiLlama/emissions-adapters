import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1592222400;
const qty = 10_000_000;



const compound: Protocol = {
  Liquidity_Mining: manualLinear(start, start + periodToSeconds.month * 42, qty * 0.421),
  Team_Founders: manualLinear(start, start + periodToSeconds.week * 208, qty * 0.225),
  ShareHolders: manualCliff(start, qty * 0.24),
  Community: manualCliff(start, qty * 0.077),
  Future_Team: manualCliff(start, qty * 0.037),
  notes: [
    `No mention regarding if the team founders tokens are vested or not.`,
  ],
  token: "ethereum:0xc00e94cb662c3520282e6f5717214004a7f26888",
  sources: ["https://medium.com/compound-finance/compound-governance-decentralized-b18659f811e0"],
  protocolIds: ["114"],
};

export default compound;