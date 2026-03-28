import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryMerklCampaigns } from "../utils/queries";

const DISTRIBUTION_CREATOR = '0x8bb4c975ff3c250e0ceea271728547f3802b36fd'
const NEW_CAMPAIGN_TOPIC = '0x6e3c6fa6d4815a856783888c5c3ea2ad7e7303ac0cca66c99f5bd93502c44299'
const QUICK_TOKENS = [
  '0xb5c064f955d8e7f38fe0460c556a72987494ee17', // polygon
  '0x7094c27f342dbadfbbed005b219431595e33b305', // base
  '0x6ef08F42C936f5d101B76160c816D3c8181C9867', // soneium
  '0xE22E3D44Ea9Fb0A87Ea3F7a8f41D869C677f0020', // manta
]

const merklCampaigns = async (): Promise<CliffAdapterResult[]> => {
  const campaigns = await queryMerklCampaigns(QUICK_TOKENS, DISTRIBUTION_CREATOR)

  // Amortize each campaign evenly across its duration days
  const dailyMap = new Map<number, number>();
  for (const c of campaigns) {
    const amount = Number(c.amount);
    const startTs = Number(c.start_timestamp);
    const durationSec = Number(c.duration);
    if (durationSec <= 0 || amount <= 0) continue;

    const durationDays = Math.ceil(durationSec / 86400);
    const dailyAmount = amount / durationDays;
    for (let day = 0; day < durationDays; day++) {
      const dayTs = Math.floor((startTs + day * 86400) / 86400) * 86400; // normalize to day start
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

const incentivesSection: SectionV2 = {
  displayName: "Liquidity Mining",
  methodology: "Tracks QUICK tokens distributed to farms using Merkl DistributionCreator campaigns",
  isIncentive: true,
  components: [
    {
      id: "merkl-campaigns",
      name: "Merkl Campaigns",
      methodology: "Tracks NewCampaign events from Merkl DistributionCreator. Campaign amounts are amortized evenly across their duration. Filters for QUICK reward token across Polygon, Base, Soneium and Manta.",
      isIncentive: true,
      fetch: merklCampaigns,
      metadata: {
        contract: DISTRIBUTION_CREATOR,
        chains: ["polygon", "base", "soneium", "manta"],
        eventSignature: NEW_CAMPAIGN_TOPIC,
      },
    },
  ],
};

const quickswap: ProtocolV2 = {
  "Liquidity Mining": incentivesSection,
  meta: {
    version: 2,
    sources: [
      "https://docs.quickswap.exchange/tokens/quick",
      "https://docs.quickswap.exchange/overview/contracts-and-addresses"
    ],
    token: "coingecko:quickswap",
    protocolIds: ["parent#quickswap"],
    notes: [
      "Only tracks ongoing Merkl incentive campaigns on Polygon, Base, Soneium and Manta.",
    ],
    incentivesOnly: true
  },
  categories: {
    farming: ["Liquidity Mining"],
  },
};
export default quickswap;
