import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1761177600; // 2025-10-23
const total = 1_000_000_000;
const shares = {
    mercurialHolders: total * 0.15,
    mercurialReserve: total * 0.05,
    lpStimulus: total * 0.15,
    launchpad: total * 0.03,
    offchainContributors: total * 0.02,
    jupStakers: total * 0.03,
    m3m3Plan: total * 0.02,
    TGEReserve: total * 0.03,
    team: total * 0.18,
    meteoraReserve: total * 0.34
}

const meteora: Protocol = {
    "Mercurial Stakeholders": manualCliff(start, shares.mercurialHolders),
    "Mercurial Reserve": manualCliff(start, shares.mercurialReserve),
    "LP Stimulus Plan": manualCliff(start, shares.lpStimulus),
    "Launchpads": manualCliff(start, shares.launchpad),
    "Off chain contributors": manualCliff(start, shares.offchainContributors),
    "Jupiter Stakers": manualCliff(start, shares.jupStakers),
    "M3M3 Plan": manualCliff(start, shares.m3m3Plan),
    "TGE Reserve": manualCliff(start, shares.TGEReserve),
    "Team": manualLinear(start + periodToSeconds.month, start + periodToSeconds.months(72), shares.team),
    "Meteora Reserve": manualLinear(start + periodToSeconds.month, start + periodToSeconds.months(72), shares.meteoraReserve),
    meta: {
        notes: ["The Meteora Reserve allocaiton will be vested over 6 years, tokens in this bucket are to be used as liquidity mining rewards after TGE, to be strategically leveraged by the Meteora Team to attract liquidity providers"],
        token: "coingecko:meteora",
        sources: ["https://docs.meteora.ag/met/tokenomics", "https://meteoraag.medium.com/meteora-genesis-summary-21-october-2025-3a9d914c437f"],
        protocolIds: ["parent#meteora"],
        total,
    },
    categories: {
        insiders: ["Team"],
        farming: ["Meteora Reserve"],
        publicSale: ["TGE Reserve"],
        airdrop: ["Mercurial Stakeholders", "Mercurial Reserve", "LP Stimulus Plan", "Launchpads", "Off chain contributors", "Jupiter Stakers", "M3M3 Plan"],
    },
};
export default meteora;