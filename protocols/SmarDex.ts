import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import type { LinearAdapterResult, Protocol } from "../types/adapters";

const start: number = 1678404995; // birthBlock timestamp
const maximumSupply: number = 10_000_000_000;
const rewardYears: number = 10;
const boostWeeks: number = 4;


const boost = (amountAllocated: number): LinearAdapterResult[] => {
  let sections: LinearAdapterResult[] = [];
  let thisStart: number = start;

  for (let week = 0; week < boostWeeks; week++) {
    const qty: number = amountAllocated * (0.4 - 0.1 * week);

    sections.push(
      manualLinear(
        thisStart,
        thisStart + periodToSeconds.week,
        qty,
      ),
    );

    thisStart += periodToSeconds.week;
  }

  return sections;
};

const rewards = (amountAllocated: number): LinearAdapterResult[] => {
  let sections: LinearAdapterResult[] = [];
  let thisStart: number = start;
  const lastYearCorrection = 2989767;

  for (let year = 1; year <= rewardYears; year++) {
    const qty: number = year === 10 ? amountAllocated * 0.5 ** (year -1) - lastYearCorrection : amountAllocated * 0.5 ** year;

    sections.push(
      manualLinear(
        thisStart,
        thisStart + periodToSeconds.year,
        qty,
      ),
    );

    thisStart += periodToSeconds.year;
  }

  return sections;
};

const SmarDex: Protocol = {
  "Initial Pool mint": manualCliff(start, maximumSupply * 0.5),
  Farming: rewards(maximumSupply * 0.375),
  Boost: boost(maximumSupply * 0.125),
  notes: [
    "There are 3 stages of token emissions:",
    "1) 50% minted and distributed by initial pool to users.",
    "2) 12.5% allocated as Boost reward at protocol launch.",
    "3) 37.5% allocated for Farming rewards.",
  ],
  sources: ["https://docs.smardex.io/overview/what-is-smardex/tokenomics"],
  token: "ethereum:0x5de8ab7e27f6e7a1fff3e5b337584aa43961beef",
  protocolIds: [],
};
export default SmarDex;
