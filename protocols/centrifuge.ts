import { manualCliff, manualLinear } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const total = 691_800_000;
const cp149End = 1869696000; // 2029-04-01
const teamEnd = 1898553600; // 2030-03-01
const otherEnd = 1772323200; // 2026-03-01
const asOf = 1767225600; // 2026-01-01

const shares = {
    released: total * 0.50,
    ecosystem: total * 0.24,
    team: total * 0.14,
    otherStakeholders: total * 0.001,
};

const inflation = (): LinearAdapterResult[] => {
    const sections: LinearAdapterResult[] = [];
    const yearlyRate = 0.03;
    const monthlyRate = yearlyRate / 12;
    let supply = total;
    let start = asOf;

    while (start < teamEnd) {
        const end = start + periodToSeconds.month;
        const amount = supply * monthlyRate;

        sections.push({
            type: "linear",
            start,
            end,
            amount,
        });

        supply += amount;
        start = end;
    }

    return sections;
};

const centrifuge: Protocol = {
    "Released": manualCliff(asOf, shares.released),
    "Ecosystem": manualCliff(asOf, shares.ecosystem),
    "Incentives Program": [manualCliff(asOf, 15_000_000), manualLinear(asOf, cp149End, 100_000_000)],
    "Team": manualLinear(asOf, teamEnd, shares.team),
    "Other Stakeholders": manualLinear(asOf, otherEnd, shares.otherStakeholders),
    "Inflation": inflation,
    meta: {
        notes: [
            "Released tokens (50%) represent all freely circulating tokens as of January 2026.",
            "Team vesting start date is not documented; modeled from January 2026.",
            "CFG has a 3% annual inflation rate directed to the Centrifuge Treasury, modeled monthly from January 2026.",
        ],
        token: "coingecko:centrifuge-2",
        sources: ["https://docs.centrifuge.io/getting-started/token-summary/"],
        protocolIds: ["parent#centrifuge"],
        total,
    },
    categories: {
        publicSale: ["Released"],
        insiders: ["Team", "Other Stakeholders"],
        noncirculating: ["Ecosystem", "Inflation"],
        farming: ["Incentives Program"],
    },
};
export default centrifuge;
