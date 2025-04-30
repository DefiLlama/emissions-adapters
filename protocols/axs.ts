import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const tgeTimestamp = 1604448000;

const quarterEnd = (quarterNumber: number) => tgeTimestamp + periodToSeconds.day * 90 * quarterNumber;

const axs: Protocol = {
  "Public Sale": [
    manualCliff(tgeTimestamp, 29_700_000),
  ],
  "Private Sale": [
    manualCliff(tgeTimestamp, 2_160_000),
    manualLinear(quarterEnd(1), quarterEnd(2), 2_160_000),
    manualLinear(quarterEnd(3), quarterEnd(4), 2_160_000),
    manualLinear(quarterEnd(5), quarterEnd(6), 2_160_000),
    manualLinear(quarterEnd(7), quarterEnd(8), 2_160_000),
  ],
  "Staking Reward": [
    manualLinear(tgeTimestamp, quarterEnd(1), 4_725_000),
    manualLinear(quarterEnd(1), quarterEnd(2), 2_283_750),
    manualLinear(quarterEnd(2), quarterEnd(3), 6_851_250),
    manualLinear(quarterEnd(3), quarterEnd(4), 6_851_250),
    manualLinear(quarterEnd(4), quarterEnd(5), 6_851_250),
    manualLinear(quarterEnd(5), quarterEnd(6), 6_198_750),
    manualLinear(quarterEnd(6), quarterEnd(7), 4_893_750),
    manualLinear(quarterEnd(7), quarterEnd(8), 4_893_750),
    manualLinear(quarterEnd(8), quarterEnd(9), 4_893_750),
    manualLinear(quarterEnd(9), quarterEnd(10), 4_404_375),
    manualLinear(quarterEnd(10), quarterEnd(11), 3_425_625),
    manualLinear(quarterEnd(11), quarterEnd(12), 3_425_625),
    manualLinear(quarterEnd(12), quarterEnd(13), 3_425_625),
    manualLinear(quarterEnd(13), quarterEnd(14), 3_099_375),
    manualLinear(quarterEnd(14), quarterEnd(15), 2_446_875),
    manualLinear(quarterEnd(15), quarterEnd(16), 2_446_875),
    manualLinear(quarterEnd(16), quarterEnd(17), 2_446_875),
    manualLinear(quarterEnd(17), quarterEnd(18), 2_283_750),
    manualLinear(quarterEnd(18), quarterEnd(19), 1_957_500),
    manualLinear(quarterEnd(19), quarterEnd(20), 1_957_500),
    manualLinear(quarterEnd(20), quarterEnd(21), 1_957_500),
    manualLinear(quarterEnd(21), quarterEnd(22), 1_305_000),
  ],
  "Play to Earn": [
    manualCliff(tgeTimestamp, 4_725_000),
    manualLinear(quarterEnd(1), quarterEnd(2), 9_450_000),
    manualLinear(quarterEnd(3), quarterEnd(4), 6_750_000),
    manualLinear(quarterEnd(5), quarterEnd(6), 6_750_000),
    manualLinear(quarterEnd(7), quarterEnd(8), 4_725_000),
    manualLinear(quarterEnd(9), quarterEnd(10), 4_725_000),
    manualLinear(quarterEnd(11), quarterEnd(12), 3_375_000),
    manualLinear(quarterEnd(13), quarterEnd(14), 3_375_000),
    manualLinear(quarterEnd(15), quarterEnd(16), 2_700_000),
    manualLinear(quarterEnd(17), quarterEnd(18), 2_700_000),
  ],
  "Advisors": [
    manualCliff(tgeTimestamp, 4_500_000),
    manualLinear(quarterEnd(1), quarterEnd(2), 1_800_000),
    manualLinear(quarterEnd(3), quarterEnd(4), 2_700_000),
    manualLinear(quarterEnd(5), quarterEnd(6), 2_700_000),
    manualLinear(quarterEnd(7), quarterEnd(8), 2_700_000),
    manualLinear(quarterEnd(9), quarterEnd(10), 2_700_000),
    manualLinear(quarterEnd(11), quarterEnd(12), 900_000),
    manualLinear(quarterEnd(13), quarterEnd(14), 900_000),
  ],
  "Sky Mavis": [
    manualCliff(tgeTimestamp, 10_800_000),
    manualLinear(quarterEnd(3), quarterEnd(4), 5_737_500),
    manualLinear(quarterEnd(5), quarterEnd(6), 5_737_500),
    manualLinear(quarterEnd(7), quarterEnd(8), 5_737_500),
    manualLinear(quarterEnd(9), quarterEnd(10), 5_737_500),
    manualLinear(quarterEnd(11), quarterEnd(12), 5_737_500),
    manualLinear(quarterEnd(13), quarterEnd(14), 5_737_500),
    manualLinear(quarterEnd(15), quarterEnd(16), 5_737_500),
    manualLinear(quarterEnd(17), quarterEnd(18), 5_737_500),
  ],
  "Ecosystem Fund": [
    manualCliff(tgeTimestamp, 8_100_000),
    manualLinear(quarterEnd(1), quarterEnd(2), 1_687_500),
    manualLinear(quarterEnd(3), quarterEnd(4), 1_687_500),
    manualLinear(quarterEnd(5), quarterEnd(6), 1_687_500),
    manualLinear(quarterEnd(7), quarterEnd(8), 1_687_500),
    manualLinear(quarterEnd(9), quarterEnd(10), 1_687_500),
    manualLinear(quarterEnd(11), quarterEnd(12), 1_687_500),
    manualLinear(quarterEnd(13), quarterEnd(14), 1_687_500),
    manualLinear(quarterEnd(15), quarterEnd(16), 1_687_500),
  ],
  meta: {
    notes: [
      "The schedule is based on the provided table data from docs.",
      "Subsequent amounts listed against '90 days after' rows are interpreted as the total amount released linearly over the 90-day period ending at that point in time.",
    ],
    sources: ["https://whitepaper.axieinfinity.com/axs/allocations-and-unlock"],
    token: `ethereum:0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b`,
    protocolIds: ["6102"],
  },
  categories: {
    publicSale: ["Public Sale"],
    farming: ["Staking Reward","Play to Earn"],
    noncirculating: ["Ecosystem Fund"],
    privateSale: ["Private Sale"],
    insiders: ["Advisors","Sky Mavis"],
  }
};

export default axs;
