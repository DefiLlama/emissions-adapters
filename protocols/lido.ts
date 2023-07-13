import { balance, latest } from "../adapters/balance";
import { manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const qty: number = 1e9;
const token: string = "0x5a98fcbea516cf06857215779fd812ca3bef1b32";
const timestampDeployed: number = 1609804800;
const chain: string = "ethereum";

const schedule = (proportion: number) =>
  manualLinear("2021-12-17", "2022-12-17", qty * proportion);

const lido: Protocol = {
  Investors: schedule(0.2218),
  "Validators & Signature Holders": schedule(0.065),
  "Initial Lido Devlopers": schedule(0.2),
  "Founders & Future Employees": schedule(0.15),
  "DAO Treasury": ()=>balance(
    ["0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c"],
    token,
    chain,
    "lido-dao",
    timestampDeployed,
  ),
  meta: {
    notes: [],
    sources: [`https://blog.lido.fi/introducing-ldo/`],
    token: `${chain}:${token}`,
    protocolIds: ["182"],
    incompleteSections: [
      {
        key: "DAO Treasury",
        allocation: qty * 0.3632,
        lastRecord: () => latest("lido-dao", timestampDeployed),
      },
    ],
  },
  categories: {
    insiders: [
      "Investors",
      "Validators & Signature Holders",
      "Initial Lido Devlopers",
      "Founders & Future Employees",
    ],
    noncirculating: ["DAO Treasury"],
  },
};
export default lido;
