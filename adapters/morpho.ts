import fetch from "node-fetch";
import { AdapterResult } from "../types/adapters";
import { manualCliff, manualLinear } from "./manual";
import { periodToSeconds, unixTimestampNow } from "../utils/time";

export default async function morpho(): Promise<AdapterResult[]> {
  const sections: AdapterResult[] = [];
  const now = unixTimestampNow();
  const res = await fetch("https://rewards.morpho.org/v1/programs").then((r) =>
    r.json(),
  );

  res.data.map(
    ({ start, created_at, end, total_rewards, current_rates, type }: any) => {
      if (!end && start > now) return;

      if (type == "airdrop-reward") {
        sections.push(
          manualCliff(start ?? created_at, Number(total_rewards / 1e18)),
        );
        return;
      }

      const amount = end
        ? Number(total_rewards)
        : estimateAmount(start, end ?? now, current_rates);
      if (!amount || amount < 0) return;

      sections.push(manualLinear(start, end ?? now, amount / 1e18));
    },
  );

  function estimateAmount(start: number, end: number, rates: any[]) {
    if (!rates.length) return 0;
    const aggregateRate = rates.reduce(
      (p: number, c: any) => p + Number(c.per_dollar_per_year),
      0,
    );
    const yearsDuration = (end - start) / periodToSeconds.year;
    return aggregateRate * yearsDuration;
  }

  return sections;
}
