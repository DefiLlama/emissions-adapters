import { balance, latest } from "../adapters/balance";
import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1679644800;
const qty = 40e9;
const token = "0x98564e70c7fcc6d947ffe6d9efed5ba68b306f2e";
const chain = "core";

const ignoreFud: Protocol = {
  "Public Launch": manualCliff(start, qty * 0.5),
  Reserved: () =>
    balance(
      ["0x9645D8E1A394B89bf0D57eB135c3C2269DcCA639"],
      token,
      chain,
      "ignore-fud",
      start,
    ),
  Ecosystem: manualCliff(start, qty * 0.06),
  "Airdrop & Marketing": manualCliff(start, qty * 0.04),
  meta: {
    token: `${chain}:${token}`,
    sources: ["https://ignore-fud.gitbook.io/ignore-fud/token-economics"],
    protocolIds: ["3332"],
    incompleteSections: [
      {
        key: "Reserved",
        allocation: qty * 0.4,
        lastRecord: () => latest("ignore-fud", start),
      },
    ],
  },
  categories: {
    noncirculating: ["Reserved", "Ecosystem"],
    publicSale: ["Public Launch"],
    airdrop: ["Airdrop & Marketing"],
  },
  total: qty
};

export default ignoreFud;
