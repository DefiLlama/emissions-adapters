import fetch from "node-fetch";
import { AdapterResult } from "../types/adapters";
import { manualCliff, manualLinear } from "./manual";
import { periodToSeconds, unixTimestampNow } from "../utils/time";

export default async function morpho(): Promise<AdapterResult[]> {
  const now = unixTimestampNow();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60); // 30 days in seconds
  
  const allowedAssets = [
    "0x58D97B57BB95320F9a05dC918Aef65434969c2B2",
    "0x9994E35Db50125E0DF82e4c2dde62496CE330999",
    "0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842"
  ].map(addr => addr.toLowerCase());

  const res = await fetch("https://rewards.morpho.org/v1/programs").then((r) =>
    r.json(),
  );

  const sections = res.data
    .filter((p: any) => p.asset && allowedAssets.includes(p.asset.address.toLowerCase()))
    .map((program: any): AdapterResult | null => {
      const start = Number(program.start ?? program.created_at);
      
      if (start > now) {
        return null;
      }

      if (program.type === "airdrop-reward") {
        if (!program.total_rewards) return null;
        
        // For airdrops, filter out if created_at is before 30 days ago
        const createdAt = Number(program.created_at);
        if (createdAt < thirtyDaysAgo) {
          return null;
        }
        
        const amount = Number(program.total_rewards) / 1e18;
        return manualCliff(start, amount);
      }

      const end = program.end ? Number(program.end) : now;
      
      // For non-airdrop programs, filter out if end is before 30 days ago
      if (end < thirtyDaysAgo) {
        return null;
      }
      
      let totalRatePerYear: bigint;

      switch (program.type) {
        case "uniform-reward":
          if (!program.current_rates || program.current_rates.length === 0) return null;
          totalRatePerYear = program.current_rates.reduce(
            (sum: bigint, rate: any) => sum + BigInt(rate.rate_per_year),
            BigInt(0)
          );
          break;
        case "market-reward":
          if (!program.supply_rate_per_year || !program.borrow_rate_per_year || !program.collateral_rate_per_year) return null;
          totalRatePerYear = 
            BigInt(program.supply_rate_per_year) +
            BigInt(program.borrow_rate_per_year) +
            BigInt(program.collateral_rate_per_year);
          break;
        case "vault-reward":
          if (!program.rate_per_year) return null;
          totalRatePerYear = BigInt(program.rate_per_year);
          break;
        default:
          return null;
      }
      
      if (totalRatePerYear <= BigInt(0)) {
        return null;
      }
      
      const durationSeconds = end - start;
      if (durationSeconds < 0) return null;

      const totalAmount = (totalRatePerYear * BigInt(durationSeconds)) / BigInt(periodToSeconds.year);

      if (totalAmount <= BigInt(0)) {
        return null;
      }
      
      return manualLinear(start, end, Number(totalAmount) / 1e18);
    });

  return sections.filter((s: AdapterResult | null): s is AdapterResult => s !== null);
}