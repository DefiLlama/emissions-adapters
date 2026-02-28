import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryDune } from "../utils/dune";
import { stringToTimestamp } from "../utils/time";

const duneData = async (): Promise<CliffAdapterResult[]> => {
    const data = await queryDune('6621804', true)
    return data.map((row: Record<string, string>) => ({
        type: 'cliff',
        start: row.date,
        amount: Number(row.amount),
        isUnlock: false
    }))
}
const ore : Protocol = {
    "Mining": duneData,
    meta: {
        token: 'solana:oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp',
        sources: [
            "https://ore.supply/about#mining"
        ],
        protocolIds: ["6893"]
    },
    categories: {
        farming: ["Mining"],
    },
}

export default ore