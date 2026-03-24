import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { years } from "../utils/time";

const start = 1732838400;
const total = 1e9;

let cachedValidatorRewards: Promise<CliffAdapterResult[]> | null = null;
const validatorRewards = (): Promise<CliffAdapterResult[]> => {
  if (!cachedValidatorRewards) {
    cachedValidatorRewards = fetch("https://api-data.asxn.xyz/api/hype-staking/metrics")
      .then(r => r.json())
      .then(res => res.dailyData
        .filter((d: any) => d.yield > 0)
        .map((d: any) => ({
          type: "cliff" as const,
          start: d.timestamp,
          amount: d.totalStake * (d.yield / 100) / 365,
          isUnlock: false
        })));
  }
  return cachedValidatorRewards;
};

const communityRewardsSection: SectionV2 = {
  displayName: "Community Rewards",
  isTBD: true,
  methodology: "HYPE tokens allocated to future community rewards with no fixed unlock schedule",
  components: [
    {
      id: "community-rewards",
      name: "Community Rewards",
      methodology: "38.888% of the supply is allocated for future community rewards, minus validator rewards already distributed",
      isTBD: true,
      fetch: async () => {
        const distributed = await validatorRewards();
        const totalDistributed = distributed.reduce((sum, d) => sum + d.amount, 0);
        return [manualCliff(start, total * 0.38888 - totalDistributed)];
      },
    },
  ],
}
const validatorRewardsSection: SectionV2 = {
  displayName: "Validator Rewards",
  isIncentive: false,
  methodology: "HYPE tokens distributed to validators",
  components: [
      {
      id: "validator-rewards",
      isIncentive: false,
      name: "Validator Rewards",
      methodology: "Validator rewards distributed based on staking yield, fetched from ASXN API",
      fetch: validatorRewards,
    },
  ]
}

const hyperliquid: ProtocolV2 = {
  "Hyper Foundation Budget": manualCliff(start, total * 0.06),
  "Community Grants": manualCliff(start, total * 0.003),
  "HIP-2": manualCliff(start, total * 0.00012),
  "Genesis Distribution": manualCliff(start, total * 0.31),
  "Core Contributors": manualLinear(
    years(start, 1),
    years(start, 3),
    total * 0.238,
  ),
  "Community Rewards": communityRewardsSection,
  "Validator Rewards": validatorRewardsSection,
  meta: {
    version: 2,
    notes: [
      "The Community Rewards schedule has been linearly extrapolated using the rate of unlocks as of 4 March 2025.",
      "Most vesting schedules will complete between 2027–2028; some will continue after 2028. Here we have used an end date of end of 2027.",
      "Although the full allocations for Hyper Foundation Budget and Community Grants were unlocked at TGE it is unclear what their spend rate is.",
      "Validator Rewards are distributed based on staking yield, which may vary over time.",
      "Total staked are fetched from ASXN API to calculate Validator Rewards distribution.",
    ],
    token: "coingecko:hyperliquid",
    sources: ["https://hyperfnd.medium.com/hype-genesis-1830a4dc2e3f", "https://data.asxn.xyz/dashboard/hype-staking", "https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/staking"],
    protocolIds: ["parent#hyperliquid"],
    total,
  },
  categories: {
    insiders: ["Core Contributors"],
    noncirculating: ["Community Grants", "Hyper Foundation Budget"],
    publicSale: ["HIP-2"],
    airdrop: ["Genesis Distribution"],
    farming: ["Community Rewards"],
    staking: ["Validator Rewards"],
  },
};
export default hyperliquid;
