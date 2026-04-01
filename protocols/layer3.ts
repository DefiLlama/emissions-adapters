import { manualCliff, manualStep } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const start = 1722297600; // July 30, 2024 TGE
const total = 3_333_333_333;

const shares = {
  community: total * 0.51,
  contributors: total * 0.253,
  investors: total * 0.232,
  advisors: total * 0.005,
};
const airdrop = 250_000_000;

const fetchStakingRewards = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '0x8e02d37b' AND short_topic0 = '0xe2403640'
    WHERE topic0 = '0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486'
      AND address = '0x8e02d37b6cad86039bdd11095b8c879b907f7d10'
    GROUP BY date
    ORDER BY date DESC
  `, {});

  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false,
  }));
};

const fetchCommunityIncentives = async (): Promise<CliffAdapterResult[]> => {
  const stakingData = await fetchStakingRewards();
  const totalStaked = stakingData.reduce((sum, d) => sum + d.amount, 0);
  const communityIncentives = shares.community - airdrop
  const remaining = communityIncentives - totalStaked;

  return [manualCliff(start, remaining)] as CliffAdapterResult[];
};

const stakingSection: SectionV2 = {
  displayName: "Staking Rewards",
  methodology: "Tracks L3 rewards paid to stakers via the Layered Staking contract. Subtracted from community incentives allocation.",
  components: [
    {
      id: "layered-staking",
      name: "Layered Staking Rewards",
      methodology: "Tracks RewardPaid events from the L3 staking contract on Ethereum.",
      fetch: fetchStakingRewards,
      metadata: {
        contract: "0x8E02d37b6Cad86039BDd11095b8c879B907F7D10",
        chain: "ethereum",
        chainId: "1",
        eventSignature: "0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486",
      },
    },
  ],
};

const communitySection: SectionV2 = {
  displayName: "Community Incentives",
  methodology: "51% community allocation minus on-chain staking rewards already distributed.",
  isTBD: true,
  components: [
    {
      id: "community-incentives",
      name: "Community Incentives",
      methodology: "The remaining community allocation minus staking rewards tracked on-chain.",
      isTBD: true,
      fetch: fetchCommunityIncentives,
    },
  ],
};

const layer3: ProtocolV2 = {
  Airdrop: manualCliff(start, airdrop),
  "Community Incentives": communitySection,
  "Staking Rewards": stakingSection,
  "Core Contributors": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    36,
    shares.contributors / 36,
  ),
  Investors: manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    36,
    shares.investors / 36,
  ),
  Advisors: manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    36,
    shares.advisors / 36,
  ),
  meta: {
    version: 2,
    token: "ethereum:0x88909D489678dD17aA6D9609F89B0419Bf78FD9a",
    sources: ["https://docs.layer3foundation.org/tokenomics"],
    protocolIds: ["7611"],
    total,
    notes: [
      "Community allocation (51%) are marked as TBD since there's no unlock schedule.",
      "Airdrop (250M) is part of Year 1 community allocation, unlocked at TGE.",
      "Staking rewards are tracked on-chain via RewardPaid events and subtracted from community incentives.",
    ],
  },
  categories: {
    airdrop: ["Airdrop"],
    farming: ["Community Incentives"],
    staking: ["Staking Rewards"],
    insiders: ["Core Contributors", "Investors", "Advisors"],
  },
};

export default layer3;
