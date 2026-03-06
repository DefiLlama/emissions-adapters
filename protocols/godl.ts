import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryDune } from "../utils/dune";

const duneData = async (): Promise<CliffAdapterResult[]> => {
    const data = await queryDune('6766168', true)
    return data.map((row: Record<string, string>) => ({
        type: 'cliff',
        start: row.date,
        amount: Number(row.amount),
        isUnlock: false
    }))
}
const godl : Protocol = {
    "Mining": duneData,
    meta: {
        notes: ['Burns are not included'],
        token: 'solana:GodL6KZ9uuUoQwELggtVzQkKmU1LfqmDokPibPeDKkhF',
        sources: [
            "https://www.godl.supply/about/tokenomics"
        ],
        protocolIds: ["7024"]
    },
    categories: {
        farming: ["Mining"],
    },
}

export default godl