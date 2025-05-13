import { balance, latest } from "../adapters/balance";
import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1732233600;
const contributor = 1700697600;
const token = "0x826180541412d574cf1336d22c0c0a287822678a";
const chain = "ethereum";

const typeA = (amount: number) =>
  manualCliff(start + periodToSeconds.year, amount);
const typeB = (amount: number) => [
  manualCliff(start, amount * 0.2),
  manualLinear(start, start + periodToSeconds.year, amount * 0.8),
];

const chainflip: Protocol = {
  "Node Operators Programs": manualCliff(start, 4_750_000),
  "Token Sale": manualCliff(start, 2_066_314),
  "Liquid Treasury": manualCliff(start, 4_968_503),
  "Strategic Investors": [typeA(18_886_906), ...typeB(3_162_974)],
  "Oxen Foundation": [typeA(3_200_000), ...typeB(1_000_000)],
  Contributors: (backfill: boolean) =>
    balance(
      ["0xCE317d9909F5dDD30dcd7331f832E906Adc81f5d"],
      token,
      chain,
      "chainflip",
      contributor,
      backfill,
    ),
  "Treasury Reserves": [],
  meta: {
    notes: [
      `Treasury Reserve (22%) has been ignored from this analysis since its token balance will remain neutral over time.`,
    ],
    token: `${chain}:${token}`,
    sources: [
      "https://docs.chainflip.io/concepts/token-economics/genesis-tokenomics",
    ],
    protocolIds: ["3853"],
    incompleteSections: [
      {
        key: "Contributors",
        allocation: 13_000_000,
        lastRecord: (backfill: boolean) =>
          latest("chainflip", contributor, backfill),
      },
    ],
  },
  categories: {
    farming: ["Node Operators Programs"],
    publicSale: ["Token Sale"],
    noncirculating: ["Liquid Treasury", "Treasury Reserves"],
    privateSale: ["Strategic Investors"],
    insiders: ["Oxen Foundation", "Contributors"],
  },
};

export default chainflip;
