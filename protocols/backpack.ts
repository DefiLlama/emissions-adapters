import { CliffAdapterResult, Protocol } from "../types/adapters";
import { manualCliff } from "../adapters/manual";
import { queryDuneSQLCached } from "../utils/dune";

const total = 1_000_000_000; 
const start = 1774224000; // 2026-03-23

const growthTriggeredUnlocks = async (): Promise<CliffAdapterResult[]> => {
  return await queryDuneSQLCached(`
    SELECT 
        to_unixtime(block_date) AS date, 
        amount_display AS amount 
    FROM tokens_solana.transfers
    WHERE from_token_account ='2pWK2bHBah35yPDQdndtwTXry1JtR8LKF59tQrqgaU6s'
        AND block_date >= START
    ORDER BY block_date ASC
`, start, {protocolSlug: "backpack", allocation: "Growth Triggered Unlocks"})
}

const backpack: Protocol = {
    "Points Airdrop": manualCliff(start, total * 0.24),
    "Mad Lads Airdrop": manualCliff(start, total * 0.01),
    "Growth Triggered Unlocks": growthTriggeredUnlocks,
    meta: {
        notes: [
            "The Growth Triggered Unlocks allocation has 37.5% of the total supply. These tokens are progressively unlocked as Backpack hits regulatory, product, and market milestones.",
            "All the tokens from the Growth Triggered Unlocks allocation go directly to users",
            "The Corporate Treasury (37.5%) is fully locked until 1 year post-IPO and is not included as an allocation since the IPO date is not known yet."
          ],
        token: "coingecko:backpack",
        sources: [
            "https://backpack.exchange/bp",
            "https://learn.backpack.exchange/blog/backpack-tokenomics"
        ],
        protocolIds: ["4266"],
        total
    },
    categories: {
        airdrop: ["Points Airdrop", "Mad Lads Airdrop", "Growth Triggered Unlocks"],
    },
};

export default backpack;