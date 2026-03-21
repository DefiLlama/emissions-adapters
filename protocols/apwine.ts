import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { queryMerklCampaigns } from "../utils/queries";

const total = 5e7;
const start = 1621209600;
const token = "0x4104b135DBC9609Fc1A9490E61369036497660c8";
const chain = "ethereum";

const DISTRIBUTION_CREATOR = '0x8bb4c975ff3c250e0ceea271728547f3802b36fd'
const NEW_CAMPAIGN_TOPIC = '0x6e3c6fa6d4815a856783888c5c3ea2ad7e7303ac0cca66c99f5bd93502c44299'
const SPECTRA_TOKENS = [
  '0x64fcc3a02eeeba05ef701b7eed066c6ebd5d4e51', // base and arbitrum
  '0x6a89228055c7c28430692e342f149f37462b478b', // ethereum
  '0x248f43b622ce2f35a14db3fc528284730b619cd5', // optimism
]

const merklCampaigns = async (): Promise<CliffAdapterResult[]> => {
  const campaigns = await queryMerklCampaigns(SPECTRA_TOKENS, DISTRIBUTION_CREATOR)

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
  displayName: "Gauge Emissions",
  methodology: "Tracks the Gauge emissions of SPECTRA tokens using Merkl DistributionCreator campaigns",
  isIncentive: true,
  components: [
    {
      id: "merkl-campaigns",
      name: "Merkl Campaigns",
      methodology: "Tracks NewCampaign events from Merkl DistributionCreator. Campaign amounts are amortized evenly across their duration. Filters for SPECTRA reward token across Base, Ethereum, Optimism and Arbitrum.",
      isIncentive: true,
      fetch: merklCampaigns,
      metadata: {
        contract: DISTRIBUTION_CREATOR,
        chains: ["base", "ethereum", "optimism", "arbitrum"],
        eventSignature: NEW_CAMPAIGN_TOPIC,
      },
    },
  ],
};

const apwine: ProtocolV2 = {
  Team: manualLinear(start, start + periodToSeconds.years(4), total * 0.28056),
  Advisors: manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.0068,
  ),
  "Seed & Pre-seed": manualLinear(
    start,
    start + periodToSeconds.years(2),
    total * 0.08264,
  ),
  Bootstrap: manualCliff(start, total * 0.07),
  "Airdrop": manualCliff(1639702800, 588_430),
  "Gauge Emissions": incentivesSection,
  meta: {
    version: 2,
    notes: [
      "It has been assumed that Advisors are on the same vesting schedule as the team.",
    ],
    sources: [
      "https://medium.com/apwine/apwine-tokenomics-50e0db1cc33d",
      "https://medium.com/apwine/apwine-genesis-airdrop-and-apw-locking-749447817687",
      "https://docs.spectra.finance/tokenomics/spectra"
    ],
    token: `${chain}:${token}`,
    protocolIds: ["parent#spectra"],
  },
  categories: {
    publicSale: ["Bootstrap"],
    farming: ["Gauge Emissions"],
    airdrop: ["Airdrop"],
    privateSale: ["Seed & Pre-seed"],
    insiders: ["Advisors", "Team"],
  },
};
export default apwine;
