import { CliffAdapterResult, Protocol } from "../types/adapters";
import { manualLinear, manualCliff } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { queryDuneSQLCached } from "../utils/dune";

const totalSupply = 555_000_000; 
const RAY_TGE = 1613865600; // Sunday, February 21, 2021

// Allocations
const miningReserveTotalAllocation = totalSupply * 0.34; // 34%
const partnershipEcosystemAllocation = totalSupply * 0.30; // 30%
const teamAllocation = totalSupply * 0.20; // 20%
const liquidityAllocation = totalSupply * 0.08; // 8%
const communitySeedAllocation = totalSupply * 0.06; // 6%
const advisorsAllocation = totalSupply * 0.02; // 2%

const miningReserve = async (): Promise<CliffAdapterResult[]> => {
  return await queryDuneSQLCached(`
    SELECT 
        to_unixtime(block_date) AS date, 
        amount / 1e6 AS amount 
    FROM tokens_solana.transfers
    WHERE from_token_account ='fArUAncZwVbMimiWv5cPUfFsapdLd8QMXZE4VXqFagR'
        AND block_date >= START
    ORDER BY block_date ASC
`, 1612137600, {protocolSlug: "raydium", allocation: "Mining Reserve"})
}

const raydium: Protocol = {
    "Liquidity": manualCliff(
        RAY_TGE, 
        liquidityAllocation
    ),
    "Mining Reserve": miningReserve,
    "Partnership & Ecosystem": manualLinear(
        RAY_TGE, 
        RAY_TGE + periodToSeconds.year * 3, 
        partnershipEcosystemAllocation
    ),
    "Team": manualLinear(
        RAY_TGE + periodToSeconds.year, 
        RAY_TGE + periodToSeconds.year * 3, 
        teamAllocation
    ),
    "Community & Seed": manualLinear(
        RAY_TGE + periodToSeconds.year, 
        RAY_TGE + periodToSeconds.year * 3, 
        communitySeedAllocation
    ),
    "Advisors": manualLinear(
        RAY_TGE + periodToSeconds.year, 
        RAY_TGE + periodToSeconds.year * 3, 
        advisorsAllocation
    ),
    meta: {
        notes: [
            `The emission and distribution details are based on the proposed and intended token emission and distribution for RAY tokens.`,
            `Mining Reserve has a 34% allocation and its circulating supply is calculated by tracking the outflows from the address: fArUAncZwVbMimiWv5cPUfFsapdLd8QMXZE4VXqFagR`,
          ],
        token: "solana:4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        sources: [
            "https://docs.raydium.io/raydium/protocol"
        ],
        protocolIds: ["214"],
    },
    categories: {
        insiders: ["Team", "Advisors", "Community & Seed"],
        noncirculating: ["Partnership & Ecosystem"],
        farming: ["Mining Reserve"],
        liquidity: ["Liquidity"]
    },
};

export default raydium;