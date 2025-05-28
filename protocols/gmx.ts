import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryAddrAmount } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = 1658491200;

const incentives = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];

  const data = await queryAddrAmount({
    addresses: ["0x199070ddfd1cfb69173aa2f7e20906f26b363004", "0x62331a7bd1dfb3a7642b7db50b5509e57ca3154a"],
    topic0: "0x47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d4",
    startDate: "2021-09-30",
  })

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount) / 1e18,
      isUnlock: false,
    });
  }
  return result;
}

const gmx: Protocol = {
  "XVIX and Gambit migration": manualCliff(start, 6000000),
  //"Uniswap liquidity seed": manualCliff(start, 2000000),
  //"vesting from Escrowed GMX rewards": manualCliff(start, 2000000),
  //"floor price fund": manualCliff(start, 2000000),
  // "marketing, partnerships and community developers": manualCliff(
  //   start,
  //   1000000,
  // ),
  contributors: manualLinear(start, start + periodToSeconds.year * 2, 250000),
  "Claimed Vested GMX": incentives,

  meta: {
    notes: [
      "Uniswap liquidity seed, floor price fund and marketing, partnerships and community developer allocations are all released depending on requirements at the time. Here we have excluded them from analytics.",
    ],
    sources: ["https://gmxio.gitbook.io/gmx/tokenomics"],
    token: "arbitrum:0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
    protocolIds: ["337"],
  },
  categories: {
    farming: ["Claimed Vested GMX"],
  },
};
export default gmx;
