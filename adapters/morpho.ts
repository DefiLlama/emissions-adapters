import fetch from "node-fetch";
import { AdapterResult } from "../types/adapters";
import { manualCliff, manualLinear } from "./manual";
import { periodToSeconds, unixTimestampNow } from "../utils/time";

interface AggregatedReward {
  start: number;
  end: number;
  amount: number;
}

export default async function morpho(): Promise<AdapterResult[]> {
  const sections: AdapterResult[] = [];
  const now = unixTimestampNow();
  const res = await fetch("https://rewards.morpho.org/v1/programs").then((r) =>
    r.json(),
  );

  const aggregatedRewards: Map<string, AggregatedReward> = new Map();

  res.data.forEach(
    ({
      start,
      created_at,
      end,
      total_rewards,
      current_rates,
      type,
      asset,
    }: any) => {
      const effectiveStart = start ?? created_at;
      const effectiveEnd = end ?? now;

      if(asset?.address?.toLowerCase() !== "0x58D97B57BB95320F9a05dC918Aef65434969c2B2".toLowerCase() && asset?.address?.toLowerCase() !== "0x9994E35Db50125E0DF82e4c2dde62496CE330999".toLowerCase())
        return;
      
      if (!end && effectiveStart > now) return;

      if (type === "airdrop-reward") {
        sections.push(
          manualCliff(effectiveStart, Number(total_rewards) / 1e18),
        );
        return;
      }

      const amount = end
        ? Number(total_rewards)
        : estimateAmount(effectiveStart, effectiveEnd, current_rates);

      if (!amount || amount < 0) return;

      const assetId = asset?.id ?? "unknown_asset";
      const key = `${effectiveStart}-${effectiveEnd}-${assetId}`;

      const existing = aggregatedRewards.get(key);
      if (existing) {
        existing.amount += amount;
      } else {
        aggregatedRewards.set(key, {
          start: effectiveStart,
          end: effectiveEnd,
          amount: amount,
        });
      }
    },
  );

  aggregatedRewards.forEach((reward) => {
    sections.push(manualLinear(reward.start, reward.end, reward.amount / 1e18));
  });

  function estimateAmount(start: number, end: number, rates: any[] | null) {
    if (!rates || !rates.length) return 0;
    const aggregateRate = rates.reduce(
      (p: number, c: any) => p + Number(c.per_dollar_per_year),
      0,
    );
    const yearsDuration = (end - start) / periodToSeconds.year;
    return aggregateRate * yearsDuration;
  }

  return sections;
}
