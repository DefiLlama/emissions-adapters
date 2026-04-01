import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryDune, queryDuneSQLCached } from "../utils/dune";
import { stringToTimestamp } from "../utils/time";

const duneData = async (): Promise<CliffAdapterResult[]> => {
    return queryDuneSQLCached(`
        SELECT
            to_unixtime(call_block_date) as date,
            SUM(amount) / 1e11 AS amount
        FROM spl_token_solana.spl_token_call_mintTo
        WHERE account_mint = 'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp'
            AND account_account = 'GwZS8yBuPPkPgY4uh7eEhHN5EEdpkf7EBZ1za6nuP3wF'
            AND call_block_time >= START
        GROUP BY call_block_date
        ORDER BY call_block_date ASC
`, 1755043200, { protocolSlug: "ore-protocol", allocation: "Mining"})
}
const ore : Protocol = {
    "Mining": duneData,
    meta: {
        token: 'solana:oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp',
        sources: [
            "https://ore.supply/about#mining"
        ],
        protocolIds: ["6893"],
        incentivesOnly: true,
    },
    categories: {
        farming: ["Mining"],
    },
}

export default ore