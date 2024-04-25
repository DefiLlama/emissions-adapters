import { balance, latest } from "../adapters/balance";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1709679600;
const total = 15e9;
const token = "0x57e114b691db790c35207b2e685d4a43181e6061";
const chain = "ethereum";

const ena: Protocol = {
  "Core Contributors": [
    manualCliff(start + periodToSeconds.year, (total * 0.3) / 4),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      36,
      (total * 0.3 * 3) / (4 * 36),
    ),
  ],
  Investors: [
    manualCliff(start + periodToSeconds.year, (total * 0.25) / 4),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      36,
      (total * 0.25 * 3) / (4 * 36),
    ),
  ],
  Foundation: manualLinear(
    start,
    start + periodToSeconds.years(3),
    total * 0.15,
  ), // () => balance([], token, chain, "ethena", 0),
  "Ecosystem Development": manualLinear(
    start,
    start + periodToSeconds.years(3),
    total * 0.3,
  ), //() => balance([], token, chain, "ethena", 0),
  meta: {
    token: `${chain}:${token}`,
    notes: [
      `Wallet addresses couldnt be found for Foundation and Ecosystem Development sections, so a typical 3 year linear schedule has been used.`,
    ],
    sources: [
      "https://mirror.xyz/0xF99d0E4E3435cc9C9868D1C6274DfaB3e2721341/uCBp9VeuLWs-ul1b6AOUAoMg5HBB_iizMIi-11N6nT8",
    ],
    protocolIds: ["4133"],
    // incompleteSections: [
    // {
    //   allocation: total * 0.15,
    //   key: "Foundation",
    //   lastRecord: () => latest("ethena", 0),
    // },
    // {
    //   allocation: total * 0.3,
    //   key: "Ecosystem Development",
    //   lastRecord: () => latest("ethena", 0),
    // },
    // ],
  },
  categories: {
    insiders: ["Investors", "Core Contributors"],
    noncirculating: ["Foundation", "Ecosystem Development"],
  },
};

export default ena;
