import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";

const API_URL = "https://burn-stats.pancakeswap.com/data.json";

let cachedData: any = null;
const fetchData = async () => {
  if (cachedData) return cachedData;
  cachedData = await fetch(API_URL).then((res) => res.json());
  return cachedData;
};

const mintByProduct =
  (product: string) => async (): Promise<CliffAdapterResult[]> => {
    const data = await fetchData();
    return data.mintTimeSeries
      .filter((e: any) => e.product === product)
      .map((e: any) => ({
        type: "cliff" as const,
        start: Math.floor(e.timestamp / 1000),
        amount: e.mint,
      }));
  };

const farmingSection: SectionV2 = {
  displayName: "Farming Rewards",
  methodology:
    "CAKE emissions distributed to liquidity providers across AMM pools",
  isIncentive: true,
  components: [
    {
      id: "v3-farms",
      name: "v3 Farms",
      methodology: "CAKE rewards distributed to v3 AMM liquidity providers",
      isIncentive: true,
      fetch: mintByProduct("v3 Farms"),
    },
    {
      id: "v2-stableswap",
      name: "v2 + StableSwap",
      methodology:
        "CAKE rewards distributed to v2 AMM and StableSwap liquidity providers",
      isIncentive: true,
      fetch: mintByProduct("v2 + SS"),
    },
    {
      id: "infinity",
      name: "Infinity",
      methodology: "CAKE rewards for Infinity protocol participants",
      isIncentive: true,
      fetch: mintByProduct("Infinity"),
    },
    {
      id: "lottery",
      name: "Lottery",
      methodology: "CAKE minted for lottery prize pools",
      isIncentive: true,
      fetch: mintByProduct("Lottery"),
    },
  ],
};

const stakingSection: SectionV2 = {
  displayName: "Staking Rewards",
  methodology: "CAKE emissions distributed to veCAKE stakers",
  isIncentive: true,
  components: [
    {
      id: "vecake",
      name: "veCAKE (CAKE Pool)",
      methodology: "CAKE rewards distributed to veCAKE stakers",
      isIncentive: true,
      fetch: mintByProduct("veCAKE (CAKE pool)"),
    },
  ],
};

const ecosystemSection: SectionV2 = {
  displayName: "Ecosystem Growth",
  methodology: "CAKE allocated for ecosystem development and growth initiatives",
  components: [
    {
      id: "ecosystem-growth",
      name: "Ecosystem Growth",
      methodology: "CAKE allocated for ecosystem development and growth",
      fetch: mintByProduct("Ecosystem Growth"),
    },
  ],
};

const pancakeswap: ProtocolV2 = {
  "Farming Rewards": farmingSection,
  "Staking Rewards": stakingSection,
  "Ecosystem Growth": ecosystemSection,

  meta: {
    version: 2,
    sources: [
      "https://docs.pancakeswap.finance/protocol/cake-tokenomics",
      "https://dune.com/pancakeswap/PancakeSwap-CAKE-Tokenomics",
      "https://bscscan.com/address/0x45c54210128a065de780c4b0df3d16664f7f859e",
      "https://pancakeswap.finance/burn-dashboard",
    ],
    token: `bsc:0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82`,
    protocolIds: ["parent#pancakeswap"],
    notes: [
      "Tracks only user-facing CAKE emissions (farming, staking, ecosystem).",
      "Burns are not included — they reduce supply from protocol revenue and are accounted for separately.",
      "Product-level breakdown available from Sept 2021 onward.",
      "CAKE has a maximum supply of 450 million tokens.",
    ],
  },
  categories: {
    farming: ["Farming Rewards"],
    staking: ["Staking Rewards"],
    noncirculating: ["Ecosystem Growth"],
  },
};

export default pancakeswap;
