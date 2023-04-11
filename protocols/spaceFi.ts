import { Protocol } from "../types/adapters";
import { manualLog } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 600000000;
const start = 1676332800;
const end = start + periodToSeconds.year * 10;
const length = periodToSeconds.year;

const spaceFi: Protocol = {
  "Community airdrop": manualLog(start, end, qty * 0.7, length, 100 / 3),
  "DAO treasury": manualLog(start, end, qty * 0.1, length, 100 / 3),
  Team: manualLog(start, end, qty * 0.2, length, 100 / 3),
  sources: ["https://docs.spacefi.io/tokenomics/space-token"],
  token: "evmos:0x4e2d4f33d759976381d9dee04b197bf52f6bc1fc",
  protocolIds: ["1759"],
};

export default spaceFi;
