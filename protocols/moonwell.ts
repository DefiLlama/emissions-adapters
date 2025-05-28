import { balance, latest } from "../adapters/balance";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryDune } from "../utils/dune";

const start = 1652227200;
const qty = 5e9;
const chain = "moonbeam";
const address = "0x511ab53f793683763e5a8829738301368a2411e3";

const emissions = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const issuanceData = await queryDune("5199550", true)

  for (let i = 0; i < issuanceData.length; i++) {
    result.push({
      type: "cliff",
      start: issuanceData[i].timestamp,
      amount: issuanceData[i].amount,
      isUnlock: false,
    });
  }
  return result;
}

const moonwell: Protocol = {
  "WELL Rewards": emissions,
  // "Liquidity Incentives": (backfill: boolean) =>
  //   balance(
  //     ["0x6972f25ab3fc425eaf719721f0ebd1cdb58ee451"],
  //     address,
  //     chain,
  //     "moonwell",
  //     start,
  //     backfill,
  //   ),
  // "Long-Term Protocol & Ecosystem Development": (backfill: boolean) =>
  //   balance(
  //     ["0xf130e4946f862f2c6ca3d007d51c21688908e006"],
  //     address,
  //     chain,
  //     "moonwell",
  //     start,
  //     backfill,
  //   ),
  // "Application Development": (backfill: boolean) =>
  //   balance(
  //     ["0x519ee031e182d3e941549e7909c9319cff4be69a"],
  //     address,
  //     chain,
  //     "moonwell",
  //     start,
  //     backfill,
  //   ),
  // "Bootstrap & Private Sale": (backfill: boolean) =>
  //   balance(
  //     ["0xf2248fa0b30e5f8c6e4501e3222e935ca38b4b0f"],
  //     address,
  //     chain,
  //     "moonwell",
  //     start,
  //     backfill,
  //   ),
  // "Public & Strategic Sale": (backfill: boolean) =>
  //   balance(
  //     ["0x1bc67c936e4c1b99f980bd6dd15c0bf169df0eba"],
  //     address,
  //     chain,
  //     "moonwell",
  //     start,
  //     backfill,
  //   ),
  // Contributors: (backfill: boolean) =>
  //   balance(
  //     ["0xe4b19a9944060b14504936b5e58bcc06a747b738"],
  //     address,
  //     chain,
  //     "moonwell",
  //     start,
  //     backfill,
  //   ),
  meta: {
    token: `${chain}:${address}`,
    notes: [
      "We currently only track WELL rewards distributed on Base.",
    ],
    sources: [
      "https://docs.moonwell.fi/moonwell/moonwell-overview/tokens/well-transparency-report#initial-distribution",
      "https://basescan.org/address/0xfbb21d0380bee3312b33c4353c8936a0f13ef26c"
    ],
    protocolIds: ["parent#moonwell"],
    total: qty,
    // incompleteSections: [
    //   {
    //     key: "Liquidity Incentives",
    //     lastRecord: (backfill: boolean) => latest("moonwell", start, backfill),
    //     allocation: undefined,
    //   },
    //   {
    //     key: "Long-Term Protocol & Ecosystem Development",
    //     lastRecord: (backfill: boolean) => latest("moonwell", start, backfill),
    //     allocation: undefined,
    //   },
    //   {
    //     key: "Application Development",
    //     lastRecord: (backfill: boolean) => latest("moonwell", start, backfill),
    //     allocation: undefined,
    //   },
    //   {
    //     key: "Bootstrap & Private Sale",
    //     lastRecord: (backfill: boolean) => latest("moonwell", start, backfill),
    //     allocation: undefined,
    //   },
    //   {
    //     key: "Public & Strategic Sale",
    //     lastRecord: (backfill: boolean) => latest("moonwell", start, backfill),
    //     allocation: undefined,
    //   },
    //   {
    //     key: "Contributors",
    //     lastRecord: (backfill: boolean) => latest("moonwell", start, backfill),
    //     allocation: undefined,
    //   },
    // ],
  },
  categories: {
    // publicSale: ["Public Sale & Strategic Sale"],
    farming: ["WELL Rewards"],
    // noncirculating: [
    //   "Long-Term Protocol & Ecosystem Development",
    //   "Application Development",
    //   "Future Contributors",
    // ],
    // privateSale: ["Bootstrap & Private Sale", "Strategic Sale"],
    // insiders: ["Key Partners", "Advisors", "Founding Contributors"],
  },
};

export default moonwell;
