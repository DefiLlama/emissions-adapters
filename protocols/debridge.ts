import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1729123200;
const totalSupply = 10_000_000_000;

// Allocation amounts
const coreContributors = totalSupply * 0.2
const ecosystem = totalSupply * 0.26
const debridgeFoundation = totalSupply * 0.15
const community = totalSupply * 0.2
const strategicPartner = totalSupply * 0.17
const validator = totalSupply * 0.02


const debridge: Protocol = {
  "Community & Launch": [
    manualCliff(start, community * 0.1), // 10% at TGE
    manualStep(
      start + periodToSeconds.months(3), // 6 month cliff
      periodToSeconds.months(3),
      12,
      community * 0.9 / 12
    )
  ],

  "Validators":
  manualStep(
    start + periodToSeconds.months(3), // 6 month cliff
    periodToSeconds.months(3),
    12,
    validator / 12
  ),

  "Ecosystem": [
    manualCliff(start, 300_000_000),
    manualStep(
      start + periodToSeconds.months(3),
      periodToSeconds.months(3),
      12,
      (ecosystem - 300_000_000) / 12
    )
  ],

  "Core Contributors":
    manualStep(
      start + periodToSeconds.months(3), // 6 month cliff
      periodToSeconds.months(3),
      12,
      coreContributors / 12
    ),
  
    "deBridge Foundation":[
      manualCliff(start, 500_000_000),
      manualStep(
        start + periodToSeconds.months(3),
        periodToSeconds.months(3),
        12,
        (debridgeFoundation - 500_000_000) / 12
      )
    ],

  "Strategic Partners":
    manualStep(
      start + periodToSeconds.months(3), // 6 month cliff
      periodToSeconds.months(3),
      12,
      strategicPartner / 12
    ),


  
  meta: {
    token: "solana:DBRiDgJAMsM95moTzJs7M9LnkGErpbv9v6CUR1DXnUu5",
    sources: ["https://docs.debridge.foundation/faq-airdrop-season-1/dbr-tokenomics"],
    protocolIds: ["1462"],
    notes: [

    ]
  },

  categories: {
    noncirculating: ["Community & Launch","Ecosystem","deBridge Foundation"],
    farming: ["Validators"],
    privateSale: ["Strategic Partners"],
    insiders: ["Core Contributors"],
  },
};

export default debridge;