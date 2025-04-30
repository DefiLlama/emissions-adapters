import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1710720000;
const totalSupply = 10_000_000;

// Allocation amounts
const tradingBotFund = totalSupply * 0.5
const investment = totalSupply * 0.2
const team = totalSupply * 0.1
const marketMaking = totalSupply * 0.1
const marketing = totalSupply * 0.1

const quantixai: Protocol = {
  "QuantixAI Trading Bot Fund": [
    manualCliff(start, tradingBotFund * 0.1), // 10% at TGE
    manualStep(
      start + periodToSeconds.months(1), // 1 month cliff
      periodToSeconds.month,
      17,
      tradingBotFund * 0.6 / 17
    ),
    manualStep(
      start + periodToSeconds.months(18),
      periodToSeconds.month,
      6,
      tradingBotFund * 0.3 / 6
    )
  ],

  "Market Making":[
    manualCliff(start, marketMaking * 0.5), // 50% at TGE
    manualStep(
      start + periodToSeconds.months(1), // 1 month cliff
      periodToSeconds.month,
      18,
      marketMaking * 0.5 / 18
    )
  ],

  "Marketing":[
    manualStep(
      start + periodToSeconds.months(1),
      periodToSeconds.month,
      16,
      (marketing * 0.45) / 16
    ),
    manualStep(
      start + periodToSeconds.months(17),
      periodToSeconds.month,
      6,
      (marketing * 0.55) / 6
    )
  ],

  Investments:
  manualStep(
    start+periodToSeconds.months(11),
    periodToSeconds.month,
    6,
    investment / 6
  ),

  "Team": 
  manualCliff(start+ periodToSeconds.months(24), team),
  
  meta: {
    token: "ethereum:0xcb21311d3b91b5324f6c11b4f5a656fcacbff122",
    sources: ["https://quantixai.io/Tokenomics-page-1"],
    protocolIds: ["6039"],
    notes: [

    ]
  },

  categories: {
    noncirculating: ["QuantixAI Trading Bot Fund","Market Making","Marketing"],
    privateSale: ["Investments"],
    insiders: ["Team"],
  },
};

export default quantixai;