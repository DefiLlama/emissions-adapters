import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryDailyOutflows } from "../utils/queries";
import { months, periodToSeconds, readableToSeconds, years } from "../utils/time";

const start = 1608422400; // Dec 20, 2020 TGE
const totalQty = 100_000_000;
const FXS = "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0";
const COMMUNITY_TREASURY = "0x63278bf9acdfc9fa65cfa2940b89a34adfbcb4a1";

const communityDistributions = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryDailyOutflows({
    token: FXS,
    fromAddress: COMMUNITY_TREASURY,
    startDate: "2020-12-20",
  });
  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
  }));
};

const communitySection: SectionV2 = {
  displayName: "Community Distributions",
  methodology:
    "Tracks FXS outflows from community treasury. Includes gauge emissions (25K FXS/day halving annually), grants, partnerships, and governance-approved programs.",
  isIncentive: true,
  components: [
    {
      id: "community-treasury-outflows",
      name: "Community Treasury Outflows",
      methodology:
        "Tracks FXS Transfer events from community treasury (0x6327...0b4A1) to external addresses.",
      isIncentive: true,
      fetch: communityDistributions,
      metadata: {
        contract: FXS,
        treasury: COMMUNITY_TREASURY,
        chain: "ethereum",
        chainId: "1",
      },
    },
  ],
};

const fxs: ProtocolV2 = {
  "Team / Founders": manualLinear(
    start + periodToSeconds.month * 6,
    start + periodToSeconds.year,
    totalQty * 0.2,
  ),
  "Strategic Advisors": manualLinear(
    start,
    years(start, 3),
    totalQty * 0.03,
  ),
  "Accredited Private Investors": [
    manualCliff(start, totalQty * 0.02),
    manualLinear(start, months(start, 6), totalQty * 0.05),
    manualLinear(
      months(start, 6),
      years(start, 1),
      totalQty * 0.05,
    ), 
  ],
  "Project Team Treasury": manualCliff(start, totalQty * 0.05), 
  "Initial Farming Rewards": manualCliff(start, 13_016_120), 
  "Liquidity Programs & Farming": communitySection,
  meta: {
    version: 2,
    sources: [
      "https://docs.frax.finance/token-distribution/frax-share-fxs-distribution",
    ],
    token: `ethereum:${FXS}`,
    protocolIds: ["parent#frax-finance"],
    total: totalQty,
    notes: [
      "Initial Farming: ~13M FXS sent by deployer directly to 4 LP staking contracts (FRAX/USDC, FRAX/WETH, FRAX/FXS, FXS/WETH) at deploy",
      "Community: ~47M tracked via on-chain outflows from community treasury (0x6327...0b4A1), includes gauge emissions and governance distributions",
    ],
  },
  categories: {
    insiders: ["Team / Founders", "Strategic Advisors"],
    privateSale: ["Accredited Private Investors"],
    noncirculating: ["Project Team Treasury"],
    farming: ["Initial Farming Rewards", "Liquidity Programs & Farming"],
  },
};

export default fxs;
