import { balance, latest } from "../adapters/balance";
import { manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const timestamps: { [key: string]: number } = {
  start: 1696464000,
  airdrops: 1715040000,
  foundation: 1714694400,
};

const total = 1e10;
const token = "0xDfc7C877a950e49D2610114102175A06C2e3167a";
const chain = "mode";

const mode: Protocol = {
  "User & Developer Airdrops": () =>
    balance(
      ["0x9cBd6d7B3f7377365E45CF53937E96ed8b92E53d"],
      token,
      chain,
      "mode",
      timestamps.airdrops,
    ),
  "Foundation & Treasury": () =>
    balance(
      ["0xaa9703BEa2aaE3E6DB568D20fb16cAAD3096FDf8"],
      token,
      chain,
      "mode",
      timestamps.foundation,
    ),
  Investors: manualLinear(
    timestamps.start + periodToSeconds.year,
    timestamps.start + periodToSeconds.years(3),
    total * 0.19,
  ),
  "Core Contributors": manualLinear(
    timestamps.start + periodToSeconds.year,
    timestamps.start + periodToSeconds.years(3),
    total * 0.19,
  ),
  meta: {
    token: `${chain}:${token}`,
    sources: [`https://docs.mode.network/usdmode/quick-start-2`],
    protocolIds: ["4237"],
    incompleteSections: [
      {
        key: "User & Developer Airdrops",
        allocation: total * 0.35,
        lastRecord: () => latest("mode", timestamps.airdrops),
      },
      {
        key: "Foundation & Treasury",
        allocation: total * 0.27,
        lastRecord: () => latest("mode", timestamps.foundation),
      },
    ],
  },
  categories: {
    airdrop: ["User & Developer Airdrops"],
    insiders: ["Core Contributors", "Investors"],
    noncirculating: ["Foundation & Treasury"],
  },
};

export default mode;
