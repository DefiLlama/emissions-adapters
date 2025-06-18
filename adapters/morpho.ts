import fetch from "node-fetch";
import { AdapterResult } from "../types/adapters";
import { manualLinear } from "./manual";
import { periodToSeconds, unixTimestampNow } from "../utils/time";

export default async function morpho(): Promise<AdapterResult[]> {
  const now = unixTimestampNow();
  const thirtyDaysInSeconds = periodToSeconds.day * 30;
  const thirtyDaysAgo = now - thirtyDaysInSeconds;

  const res = await fetch("https://rewards.morpho.org/v1/programs").then((r) =>
    r.json(),
  );

  let totalEmissionsInLast30Days_wei = BigInt(0);

  const allowedAssets = [
    "0x58D97B57BB95320F9a05dC918Aef65434969c2B2",
    "0x9994E35Db50125E0DF82e4c2dde62496CE330999",
    "0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842"
  ].map(addr => addr.toLowerCase());

  for (const program of res.data) {
    if (!program.asset || !allowedAssets.includes(program.asset.address.toLowerCase())) {
      continue;
    }

    const progStartTimestamp = Number(program.start ?? program.created_at);
    const progActualEndTimestamp = program.end ? Number(program.end) : Infinity;

    // Skip programs that ended before our 30-day window or haven't started yet
    if (progActualEndTimestamp < thirtyDaysAgo || progStartTimestamp > now) {
      continue;
    }

    if (program.type === "airdrop-reward") {
      if (!program.total_rewards) continue;
      // Count airdrop if it happened within the last 30 days
      if (progStartTimestamp >= thirtyDaysAgo && progStartTimestamp <= now) {
        totalEmissionsInLast30Days_wei += BigInt(program.total_rewards);
      }
    } else {
      // Linear reward types
      let totalRatePerYear_wei: bigint;
      
      switch (program.type) {
        case "uniform-reward":
          if (!program.current_rates || program.current_rates.length === 0) continue;
          totalRatePerYear_wei = program.current_rates.reduce(
            (sum: bigint, rate: any) => sum + BigInt(rate.rate_per_year),
            BigInt(0)
          );
          break;
        case "market-reward":
          if (!program.supply_rate_per_year || !program.borrow_rate_per_year || !program.collateral_rate_per_year) continue;
          totalRatePerYear_wei =
            BigInt(program.supply_rate_per_year) +
            BigInt(program.borrow_rate_per_year) +
            BigInt(program.collateral_rate_per_year);
          break;
        case "vault-reward":
          if (!program.rate_per_year) continue;
          totalRatePerYear_wei = BigInt(program.rate_per_year);
          break;
        default:
          continue;
      }

      if (totalRatePerYear_wei <= BigInt(0)) {
        continue;
      }

      // Calculate overlap with 30-day window
      const emissionPeriodStart = Math.max(progStartTimestamp, thirtyDaysAgo);
      const emissionPeriodEnd = Math.min(progActualEndTimestamp, now);
      const overlapDurationSeconds = emissionPeriodEnd - emissionPeriodStart;

      if (overlapDurationSeconds > 0) {
        const emissionInOverlap_wei = (totalRatePerYear_wei * BigInt(overlapDurationSeconds)) / BigInt(periodToSeconds.year);
        totalEmissionsInLast30Days_wei += emissionInOverlap_wei;
      }
    }
  }

  // Convert to tokens and annualize
  const totalEmissionsLast30Days_tokens = Number(totalEmissionsInLast30Days_wei) / 1e18;
  const annualizedEmission = totalEmissionsLast30Days_tokens * 12;

  // Return as a single linear emission over the next year
  // This represents the annualized rate based on the last 30 days
  return [
    manualLinear(now, now + periodToSeconds.year, annualizedEmission)
  ];
}