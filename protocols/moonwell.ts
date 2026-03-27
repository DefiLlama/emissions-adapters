import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryDailyOutflows, queryMerklCampaigns } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const chain = "base";
const token = "0xa88594d404727625a9437c3f886c7643872296ae";

const wellRewardsClaims = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryDailyOutflows({
    token: token,
    tokenDecimals: 18,
    fromAddress: "0xe9005b078701e2a0948d2eac43010d35870ad9d2",
    startDate: "2024-04-19",
  });

  return data.map((d) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false,
  }));
};

const wellRewardsClaimsOP = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryDailyOutflows({
    token: token,
    tokenDecimals: 18,
    fromAddress: "0xf9524bfa18c19c3e605fbfe8dfd05c6e967574aa",
    startDate: "2024-04-19",
  });

  return data.map((d) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false,
  }));
};

const DISTRIBUTION_CREATOR = "0x8bb4c975ff3c250e0ceea271728547f3802b36fd";
const wellRewardsMerkl = async (): Promise<CliffAdapterResult[]> => {
  const campaigns = await queryMerklCampaigns(
    [token],
    DISTRIBUTION_CREATOR,
  );

  const dailyMap = new Map<number, number>();
  for (const c of campaigns) {
    const amount = Number(c.amount);
    const startTs = Number(c.start_timestamp);
    const durationSec = Number(c.duration);
    if (durationSec <= 0 || amount <= 0) continue;

    const durationDays = Math.ceil(durationSec / 86400);
    const dailyAmount = amount / durationDays;
    for (let day = 0; day < durationDays; day++) {
      const dayTs =
        Math.floor((startTs + day * 86400) / 86400) * 86400;
      dailyMap.set(dayTs, (dailyMap.get(dayTs) || 0) + dailyAmount);
    }
  }

  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([ts, amount]) => ({
      type: "cliff" as const,
      start: ts,
      amount,
      isUnlock: false,
    }));
};

const rewardsSection: SectionV2 = {
  displayName: "WELL Rewards",
  methodology: "Tracks WELL rewards distributed through claims and Merkl campaigns",
  isIncentive: true,
  components: [
    {
      id: "well-rewards-claims",
      name: "WELL Rewards (Base)",
      methodology: "Tracks WELL rewards claimed from the Base rewards contract.",
      isIncentive: true,
      fetch: wellRewardsClaims,
      metadata: {
        contract: "0xe9005b078701e2a0948d2eac43010d35870ad9d2",
        chain: "base",
      },
    },
    {
      id: "well-rewards-claims-op",
      name: "WELL Rewards (Optimism)",
      methodology: "Tracks WELL rewards claimed from the Optimism rewards contract.",
      isIncentive: true,
      fetch: wellRewardsClaimsOP,
      metadata: {
        contract: "0xf9524bfa18c19c3e605fbfe8dfd05c6e967574aa",
        chain: "optimism",
      },
    },
    {
      id: "well-rewards-merkl",
      name: "WELL Rewards (Merkl)",
      methodology: "Tracks WELL rewards distributed through Merkl campaigns.",
      isIncentive: true,
      fetch: wellRewardsMerkl,
      metadata: {
        distributionCreator: DISTRIBUTION_CREATOR,
      },
    },
  ],
};

const moonwell: ProtocolV2 = {
  "WELL Rewards": rewardsSection,
  meta: {
    version: 2,
    token: `${chain}:${token}`,
    notes: [
      "Only WELL rewards are tracked.",
    ],
    sources: [
      "https://docs.moonwell.fi/moonwell/protocol-information/contracts",
    ],
    protocolIds: ["parent#moonwell"],
    incentivesOnly: true,
  },
  categories: {
    farming: ["WELL Rewards"],
  },
};

export default moonwell;
