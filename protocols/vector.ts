import { Protocol, LinearAdapterResult } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 1000000000;
const start = 1597449600;

function lmEmissions(): LinearAdapterResult[] {
  let sections: LinearAdapterResult[] = [];
  let amount = 0.33 * periodToSeconds.month;
  let thisStart = start;
  for (let i = 0; i < 100; i++) {
    let rateOfChange = 0.01;
    if (i < 12) {
      rateOfChange = 0.05;
    } else if (i < 24) {
      rateOfChange = 0.03;
    }

    sections.push(
      manualLinear(thisStart, thisStart + periodToSeconds.month, amount),
    );

    thisStart += periodToSeconds.month;
    amount *= 1 - rateOfChange;
  }

  return sections;
}

const vector: Protocol = {
  //    LM 55% 3yr var
  "Liquidity mining": [
    manualLinear(start, "2022-11-15", 25000000),
    ...lmEmissions(),
  ],
  "Core and future team": [
    manualCliff(start + periodToSeconds.month * 3, (qty * 0.08 * 1) / 7),
    manualLinear(
      start + periodToSeconds.month * 3,
      start + periodToSeconds.month * 18,
      (0.08 * 6) / 7,
    ),
  ],
  Magnet: [
    manualCliff(start + periodToSeconds.month * 3, (qty * 0.08 * 1) / 7),
    manualLinear(
      start + periodToSeconds.month * 3,
      start + periodToSeconds.month * 18,
      (qty * 0.08 * 6) / 7,
    ),
  ],
  Advisors: [
    manualCliff(start + periodToSeconds.month * 3, (qty * 0.015 * 1) / 7),
    manualLinear(
      start + periodToSeconds.month * 3,
      start + periodToSeconds.month * 18,
      (qty * 0.015 * 6) / 7,
    ),
  ],
  "Rocket Joe": [
    manualCliff(start, qty * 0.045 * 0.11),
    manualCliff(start + periodToSeconds.day * 3, qty * 0.045 * 0.89),
  ],
  "Community treasury": [
    manualCliff(start, qty * 0.05 * 0.1),
    manualLinear(start, start + periodToSeconds.year, qty * 0.05 * 0.9),
  ],
  "vePTP airdrop": [
    manualCliff(start, qty * 0.03 * 0.1),
    manualCliff(start + periodToSeconds.month * 3, qty * 0.03 * 0.1),
    manualCliff(start + periodToSeconds.month * 6, qty * 0.03 * 0.2),
    manualCliff(start + periodToSeconds.month * 9, qty * 0.03 * 0.3),
    manualCliff(start + periodToSeconds.month * 12, qty * 0.03 * 0.3),
  ],
  meta: {
    sources: [
      "https://docs.vectorfinance.io/getting-started/tokenomics/token-distribution",
    ],
    token: "avax:0x5817d4f0b62a59b17f75207da1848c2ce75e7af4",
    notes: [
      `Bonus emmissions (15%) are minted on an as-needed basis, so havent been included in this analysis.`,
      `We couldn't find details about the liquidity mining schedule up until Nov '22. So the rate has been interpolated as a linear emission.`,
    ],
    protocolIds: ["1525"],
  },
  categories: {
    farming: ["Liquidity mining", "Rocket Joe"],
    insiders: ["Core and future team", "Magnet", "Advisors"],
    noncirculating: ["Community treasury"],
    airdrop: ["vePTP airdrop"],
  },
};

export default vector;
