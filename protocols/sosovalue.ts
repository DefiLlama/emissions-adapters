import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { queryDailyOutflows } from "../utils/queries";
import { months, readableToSeconds } from "../utils/time";

const start = 1737676800; // 2025-01-24
const total = 1_000_000_000;
const token = "0x76a0e27618462bdac7a29104bdcfff4e6bfcea2d"
const ecosystemAllocation = "0xced499f8fbe61458d28d9842326a0389d7fa9c46"
const shares = {
    coreContributors: total * 0.33,
    ecosystem: total * 0.30,
    foundation: total * 0.17,
    investors: total * 0.165,
    partners: total * 0.035,
};

async function getOutflows() {
    const data = await queryDailyOutflows({
      token: token,
      fromAddress: ecosystemAllocation,
      startDate: "2025-03-05"
    })
    return data.map(d => ({
      type: "cliff" as const,
      start: readableToSeconds(d.date),
      amount: Number(d.amount),
    }))
}

const sosovalue: Protocol = {
    "Ecosystem": getOutflows,
    "Foundation": [manualCliff(start, shares.foundation * 0.15), manualCliff("2025-09-06", total * 0.05), manualLinear(start, months(start, 60), total * 0.0945)],
    "Core Contributors": manualLinear(months(start, 18), months(start, 54), shares.coreContributors),
    "Investors": manualLinear(months(start, 12), months(start, 30), shares.investors),
    "Partners": manualLinear(months(start, 18), months(start, 54), shares.partners),
    meta: {
        notes: [
            "Foundation is split into 12% for ecosystem support and 5% for SoDEX & ValueChain validator infrastructure.",
            "Ecosystem includes the initial airdrop, incentives and general development.",
            "Ecosystem has a 30% allocation and its circulating supply is calculated tracking the outflows from this address: 0xced499f8fbe61458d28d9842326a0389d7fa9c46"
        ],
        token: "coingecko:sosovalue",
        sources: [
            "https://sosovalue-white-paper.gitbook.io/sosovalue-whitepaper/8.-tokennomics/8.2-tokenomics",
        ],
        protocolIds: ["parent#sosovalue"],
        total,
    },
    categories: {
        insiders: ["Core Contributors", "Partners"],
        noncirculating: ["Foundation"],
        farming: ["Ecosystem"],
        privateSale: ["Investors"],
    },
};
export default sosovalue;
