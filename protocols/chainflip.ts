import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds, readableToSeconds, unixTimestampNow } from "../utils/time";
import { queryDailyOutflows } from "../utils/queries";

const start = 1732233600; // Nov'24
const tge = 1700697600; // Nov'23
const token = "0x826180541412d574cf1336d22c0c0a287822678a";
const chain = "ethereum";
const now = unixTimestampNow()
const elapsed = now - start
const monthsPassed = Math.floor(elapsed / periodToSeconds.month)
const emissionsPerMonth = 352_000
const contributorsAddress = "0xce317d9909f5ddd30dcd7331f832e906adc81f5d";

async function getOutflows() {
    const data = await queryDailyOutflows({
      token: token,
      fromAddress: contributorsAddress,
      startDate: "2024-11-01"
    })
    return data.map(d => ({
      type: "cliff" as const,
      start: readableToSeconds(d.date),
      amount: Number(d.amount),
    }))
}
 
const chainflip: Protocol = {
  "Node Operators Programs": manualCliff(start, 4_750_000),
  "Token Sale": manualCliff(start, 2_066_314),
  "Liquid Treasury": manualCliff(start, 4_968_503),
  "Strategic Investors": manualCliff(start, 34_181_497),
  "Oxen Foundation": manualCliff(start, 4_200_000),
  Contributors: getOutflows,
  "Treasury Reserves": [],
  "Protocol Emissions": manualLinear(start, now, emissionsPerMonth * monthsPassed),
  meta: {
    notes: [
      `Treasury Reserve (22%) has been ignored from this analysis since its token balance will remain neutral over time.`,
      "Protocol emissions are calculated at a rate of 352,000 FLIP per month, as specified in the sources"
    ],
    token: `${chain}:${token}`,
    sources: [
      "https://docs.chainflip.io/protocol/token-economics/genesis-token-economics-pre-2023",
      "https://docs.chainflip.io/protocol/token-economics/current-token-economics-2025-and-beyond"
    ],
    protocolIds: ["3853"],
  },
  categories: {
    staking: ["Protocol Emissions"],
    farming: ["Node Operators Programs"],
    publicSale: ["Token Sale"],
    noncirculating: ["Liquid Treasury", "Treasury Reserves"],
    privateSale: ["Strategic Investors"],
    insiders: ["Oxen Foundation", "Contributors"],
  },
};

export default chainflip;
