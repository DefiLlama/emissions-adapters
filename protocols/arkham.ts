import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { queryDailyOutflows } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = 1689634800;
const qty = 1e9;
const token = "0x6e2a43be0b1d33b726f0ca3b8de60b3482b8b050";
const chain = "ethereum";

const insiderSchedule = (perc: number) =>
  manualLinear(
    start + periodToSeconds.year,
    start + periodToSeconds.year * 4,
    perc * qty,
  );

const ecosystemAllocation = "0xd6abb89b27eadc93c79649af472d238ed2b40165";

async function getOutflows() {
    const data = await queryDailyOutflows({
      token: token,
      fromAddress: ecosystemAllocation,
      startDate: "2023-07-17"
    })
    return data.map(d => ({
      type: "cliff" as const,
      start: readableToSeconds(d.date),
      amount: Number(d.amount),
    }))
}

const arkham: Protocol = {
  "Ecosystem Incentives and Grants": getOutflows,
  "Core Contributors": insiderSchedule(0.2),
  Investors: insiderSchedule(0.175),
  "Foundation Treasury": manualLinear(
    start,
    start + periodToSeconds.year * 7,
    qty * 0.172,
  ),
  "Binance Launchpad": manualCliff(start, qty * 0.05),
  Advisors: insiderSchedule(0.03),
  meta: {
    token: `${chain}:${token}`,
    sources: ["https://codex.arkm.com/tokenomics", "https://etherscan.io/address/0xd6abb89b27eadc93c79649af472d238ed2b40165"],
    notes: [
      "The Ecosystem Incentives and Grants section includes Community Rewards, Contributor Incentive Pool, Ecosystem Grants and DON PoS Rewards",
      "The current circulating supply of the Ecosystem Incentives and Grants allocation is determined by the outflows from this address: 0xd6aBb89b27eADC93C79649aF472d238ED2B40165",
    ],
    protocolIds: ["3269"],
  },
  categories: {
    farming: ["Ecosystem Incentives and Grants"],
    noncirculating: ["Foundation Treasury"],
    publicSale: ["Binance Launchpad"],
    privateSale: ["Investors"],
    insiders: ["Core Contributors","Advisors"],
  },
};

export default arkham;
