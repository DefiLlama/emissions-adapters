import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualLog } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { balance, latest } from "../adapters/balance";

const total = 5e7;
const start = 1621209600;
const token = "0x4104b135DBC9609Fc1A9490E61369036497660c8";
const chain = "ethereum";

const apwine: Protocol = {
  Team: manualLinear(start, start + periodToSeconds.years(4), total * 0.28056),
  Advisors: manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.0068,
  ),
  "Seed & Pre-seed": manualLinear(
    start,
    start + periodToSeconds.years(2),
    total * 0.08264,
  ),
  Bootstrap: manualCliff(start, total * 0.07),
  DAO: (backfill: boolean) =>
    balance(
      ["0xDbbfc051D200438dd5847b093B22484B842de9E7"],
      token,
      chain,
      "apwine",
      1621684800,
      backfill,
    ),
  documented: {
    replaces: ["DAO"],
    Airdrop: [manualCliff(1639702800, total * 0.0118)],
    "Liquidity Incentives": [
      manualLog(
        start,
        start + periodToSeconds.years(7),
        total * 0.48,
        periodToSeconds.month,
        2.718,
        true,
      ),
    ],
    ecosystem: manualLinear(
      start,
      start + periodToSeconds.years(7),
      total * 0.0682,
    ),
  },
  meta: {
    notes: [
      "It has been assumed that Advisors are on the same vesting schedule as the team.",
    ],
    sources: [
      "https://medium.com/apwine/apwine-tokenomics-50e0db1cc33d",
      "https://medium.com/apwine/apwine-genesis-airdrop-and-apw-locking-749447817687",
    ],
    token: `${chain}:${token}`,
    protocolIds: ["1109"],
    incompleteSections: [
      {
        lastRecord: (backfill: boolean) =>
          latest("apwine", 1621684800, backfill),
        key: "DAO",
        allocation: total * 0.56,
      },
    ],
  },
  categories: {
    publicSale: ["Bootstrap"],
    farming: ["Liquidity Incentives"],
    airdrop: ["Airdrop"],
    noncirculating: ["Ecosystem"],
    privateSale: ["Seed & Pre-seed"],
    insiders: ["Advisors", "Team"],
  },
};
export default apwine;
