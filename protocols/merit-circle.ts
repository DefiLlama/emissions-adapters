import { balance, latest } from "../adapters/balance";
import { manualCliff } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";

const token = "0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6";
const chain = "ethereum";
const qty = 1e9;
const realtime = (holder: string, deployed: number) =>
  async()=>balance([holder], token, chain, "merit-circle", deployed).then(
    (s: CliffAdapterResult[]) =>
      s.filter((c: CliffAdapterResult) => c.amount < 1e8),
  );

const merit: Protocol = {
  "Community Incentives": realtime(
    "0x56475a4a8D00b6F7b01E0879CBbba609707aef6b",
    1641513600,
  ),
  Contributors: realtime(
    "0x97173277FED329ee844BAfa44D7719ad372a7150",
    1668124800,
  ),
  "DAO Treasury": realtime(
    "0x7e9e4c0876B2102F33A1d82117Cc73B7FddD0032",
    1635548400,
  ),
  "Early Contributors": realtime(
    "0xB5A0cbB4fC7294642216Cd7AFbc3525B24316cbc",
    1652137200,
  ),
  "Liquidity Rewards": manualCliff(1633042800, qty * 0.1),
  "Public Distribution": manualCliff(1633042800, qty * 0.075),
  "Retroactive Rewards": realtime(
    "0x4f6d9907fBc54feDeA9296860d36E14ccC348F7A",
    1640649600,
  ),
  meta: {
    notes: [],
    token: `${chain}:${token}`,
    sources: [
      `https://meritcircle.gitbook.io/merit-circle/merit-circle-usdmc/merit-circle-usdmc/token-distribution`,
    ],
    protocolIds: ["1048"],
    incompleteSections: [
      {
        key: "Community Incentives",
        allocation: qty * 0.302,
        lastRecord: () => latest("merit-circle", 1641513600),
      },
      {
        key: "Contributors",
        allocation: qty * 0.2,
        lastRecord: () => latest("merit-circle", 1668124800),
      },
      {
        key: "DAO Treasury",
        allocation: undefined,
        lastRecord: () => latest("merit-circle", 1635548400),
      },
      {
        key: "Early Contributors",
        allocation: qty * 0.141,
        lastRecord: () => latest("merit-circle", 1652137200),
      },
      {
        key: "Retroactive Rewards",
        allocation: qty * 0.034,
        lastRecord: () => latest("merit-circle", 1640649600),
      },
    ],
  },
  categories: {
    insiders: ["Contributors", "Early Contributors", "Retroactive Rewards"],
    farming: ["Community Incentives", "Liquidity Rewards"],
    publicSale: ["Public Distribution"],
    noncirculating: ["DAO Treasury"],
  },
  total: qty
};

export default merit;
