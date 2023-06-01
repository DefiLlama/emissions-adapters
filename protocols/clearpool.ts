import { balance, latest } from "../adapters/balance";
import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1642982400;
const qty = 10000000;
const token = "0x66761fa41377003622aee3c7675fc7b5c1c2fac5";
const chain = "ethereum";

const balanceAllocation = (address: string) =>
  balance([address], token, chain, "clearpool", start);

const incompleteSection = (key: string, allocation: number) => ({
  key: key,
  allocation: qty * allocation,
  lastRecord: latest("clearpool", start),
});

const clearpool: Protocol = {
  "Seed Investors": manualLinear(
    start,
    start + periodToSeconds.year,
    qty * 0.0333,
  ),
  "Private Investors": [
    manualCliff(start + periodToSeconds.month * 3, qty * 0.9 * 0.2),
    manualLinear(
      start + periodToSeconds.month * 3,
      start + periodToSeconds.month * 15,
      qty * 0.09 * 0.8,
    ),
  ],
  "Public Investors": [
    manualCliff(start, (qty * 0.0035) / 2),
    manualCliff(start + periodToSeconds.month * 6, (qty * 0.0035) / 2),
  ],
  Team: [
    manualCliff(start + periodToSeconds.month * 6, qty * 0.15 * 0.2),
    manualLinear(
      start + periodToSeconds.month * 6,
      start + periodToSeconds.month * 30,
      qty * 0.15 * 0.8,
    ),
  ],
  Ecosystem: balanceAllocation("0x5972BDA688FdFC6Ed2E09b5f0E34fb04873b22a6"),
  Partnerships: balanceAllocation("0x1A4812b71e1ccD651B8c8666B74181fd91954Eb4"),
  Rewards: balanceAllocation("0x97e4f18a84A7504e003c353Eac6e913756E820F0"),
  Liquidity: balanceAllocation("0x6352c2a2c39e1998Dc6481dAC74922729e2ca675"),
  Reserves: balanceAllocation("0x60b07A990ab29E1EF333eA037C1eE0BFd7cC2572"),
  meta: {
    token: `${chain}:${token}`,
    sources: ["https://docs.clearpool.finance/clearpool/dao/cpool/tokenomics"],
    protocolIds: ["1635"],
    incompleteSections: [
      incompleteSection("Ecosystem", 0.1015),
      incompleteSection("Partnerships", 0.1),
      incompleteSection("Rewards", 0.2),
      incompleteSection("Liquidity", 0.15),
      incompleteSection("Reserves", 0.1717),
    ],
  },
  sections: {
    noncirculating: ["Ecosystem", "Partnerships", "Reserves"],
    farming: ["Rewards"],
    publicSale: ["Liquidity"],
    insiders: [
      "Seed Investors",
      "Private Investors",
      "Public Investors",
      "Team",
    ],
  },
};

export default clearpool;
