import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { LinearAdapterResult, Protocol } from "../types/adapters";

const start = 1706227200;

const totalSupply = 250_000_000;
const liquidityMiningAllocation = totalSupply * 0.45; // 112,500,000
const contributorsAllocation = totalSupply * 0.15; // 37,500,000
const devOpsAllocation = totalSupply * 0.04; // 10,000,000
const investorsAllocation = totalSupply * 0.15; // 37,500,000
const advisorAllocation = totalSupply * 0.015; // 3,750,000
const ecosystemAllocation = totalSupply * 0.075; // 18,750,000
const liquidityAllocation = totalSupply * 0.05; // 12,500,000
const treasuryAllocation = totalSupply * 0.07; // 17,500,000

const liquidityMining = () => {
    const sections: LinearAdapterResult[] = [];
    const monthlyDecrease = 0.015; // 1.5% monthly decrease
    const initialMonthlyEmission = 2_830_459;

    let startTime = start;
    let currentEmission = initialMonthlyEmission;
    let totalEmitted = 0;

    while (totalEmitted < liquidityMiningAllocation) {
        const amount = Math.min(
            currentEmission,
            liquidityMiningAllocation - totalEmitted
        );

        sections.push({
            type: "linear",
            start: startTime,
            end: startTime + periodToSeconds.month,
            amount,
        });

        totalEmitted += amount;
        startTime += periodToSeconds.month;
        currentEmission *= (1 - monthlyDecrease);
    }

    return sections;
};

const scallop: Protocol = {
    "Liquidity": manualCliff(
        start,
        liquidityAllocation,
    ),
    "Treasury": manualCliff(
        start,
        treasuryAllocation,
    ),
    "Dev & Operation": manualLinear(
        start,
        start + periodToSeconds.years(5),
        devOpsAllocation,
    ),
    "Scallop Project Contributors": manualLinear(
        start + periodToSeconds.year,
        start + periodToSeconds.years(4),
        contributorsAllocation,
    ),
    "Strategic Partners / Investors": manualLinear(
        start,
        start + periodToSeconds.years(3),
        investorsAllocation,
    ),
    "Advisor": manualLinear(
        start + periodToSeconds.year,
        start + periodToSeconds.years(4),
        advisorAllocation,
    ),
    "Ecosystem / Community / Marketing": manualLinear(
        start,
        start + periodToSeconds.years(5),
        ecosystemAllocation,
    ),

    "Liquidity Mining": liquidityMining,


    meta: {
        notes: [
            "Liquidity Mining starts with an initial monthly emission of 2,830,459 SCA tokens, decreasing by 1.5% each subsequent month.",
            "Strategic Partners/Investors vesting is described as 'Unlock over 1-3yrs'. We assumed that it linearly unlocked over 3 years for simplicity.",
        ],
        sources: ["https://docs.scallop.io/token/scallop-token"],
        token: "sui:0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
        protocolIds: ["parent#scallop"],
    },
    categories: {
        farming: ["Liquidity Mining"],
        insiders: ["Scallop Project Contributors", "Dev & Operation", "Advisor", "Strategic Partners / Investors"],
        noncirculating: ["Treasury", "Ecosystem / Community / Marketing"],
        liquidity: ["Liquidity"],
    },
};

export default scallop;