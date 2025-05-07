import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1659657600;
const totalSupply = 400_000_000;

const funds1 = totalSupply * 0.30;
const funds2 = totalSupply * 0.50;
const privateSale = totalSupply * 0.135;
const launchpad = totalSupply * 0.0025;

const whitebit: Protocol = {
   "Funds 1": manualCliff(start, funds1),
   "Launchpad": manualCliff(start, launchpad),
   "Private Sale": manualStep(
    start + periodToSeconds.months(3),
    periodToSeconds.month,
    5,
    privateSale * 0.20
   ),
   "Funds 2": [
    manualCliff(1699833600, 39_500_000),
    manualCliff(1720828800, 39_500_000),
    manualCliff(1747094400, 39_500_000),
    manualCliff(1773360001, 81_500_000), //+1 is workaround for the cliff to be charted
   ],


  meta: {
    token: "coingecko:whitebit",
    sources: ["https://cdn.whitebit.com/wbt/whitepaper-en.pdf"],
    protocolIds: ["6143"],
    notes: [
    ]
  },

  categories: {
    privateSale: ["Private Sale"],
    noncirculating: ["Funds 1", "Funds 2"],
    liquidity: ["Launchpad"],
  }
};

export default whitebit;
