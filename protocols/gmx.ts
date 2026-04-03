import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const CLAIM_TOPIC = "0x47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d4";

const GLP_VESTERS = [
  "0xa75287d2f8b217273e7fcd7e86ef07d33972042e", // Arbitrum
  "0x62331a7bd1dfb3a7642b7db50b5509e57ca3154a", // Avax
];
const AFFILIATE_VESTERS = [
  "0x7c100c0f55a15221a4c1c5a25db8c98a81df49b2", // Arbitrum
  "0x754ec029ef9926184b4cfdea7756fbbae7f326f7",// Avax
];

const queryVesterClaims = async (addresses: string[]): Promise<CliffAdapterResult[]> => {
  const shortAddreses = addresses.map(a => `'${a.slice(0, 10)}'`).join(', ');
  const fullAddresses = addresses.map(a => `'${a}'`).join(', ');

  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 67, 64))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE short_address IN (${shortAddreses}) AND short_topic0 = '${CLAIM_TOPIC.slice(0, 10)}'
    WHERE topic0 = '${CLAIM_TOPIC}'
      AND address IN (${fullAddresses})
    GROUP BY date
    ORDER BY date DESC
  `, {});

  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false
  }));
};

const farmingSection: SectionV2 = {
  displayName: "Farming Incentives",
  methodology: "esGMX vested into GMX by GLP LPs and affiliates via vester contracts on Arbitrum and Avalanche",
  isIncentive: true,
  components: [
    {
      id: "glp-vester",
      name: "GLP LP Vesting",
      methodology: "Tracks Claim events from GLP Vester contracts on Arbitrum and Avalanche. GLP LPs earn esGMX which vests into GMX over 1 year.",
      isIncentive: true,
      fetch: () => queryVesterClaims(GLP_VESTERS),
      metadata: {
        contracts: GLP_VESTERS,
        chains: ["arbitrum", "avalanche"],
        eventSignature: CLAIM_TOPIC,
      },
    },
    {
      id: "affiliate-vester",
      name: "Affiliate Vesting",
      methodology: "Tracks Claim events from Affiliate Vester contracts on Arbitrum and Avalanche. Referral affiliates earn esGMX which vests into GMX.",
      isIncentive: true,
      fetch: () => queryVesterClaims(AFFILIATE_VESTERS),
      metadata: {
        contracts: AFFILIATE_VESTERS,
        chains: ["arbitrum", "avalanche"],
        eventSignature: CLAIM_TOPIC,
      },
    },
  ],
};

const gmx: ProtocolV2 = {
  "Farming Incentives": farmingSection,
  meta: {
    version: 2,
    token: "arbitrum:0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
    sources: ["https://docs.gmx.io/docs/tokenomics/gmx-token"],
    protocolIds: ["337"],
    notes: [
      "Only incentive emissions are tracked.",
      "esGMX is distributed to GMX stakers, GLP LPs, and affiliates, then vested into GMX over 1 year via vester contracts.",
    ],
    incentivesOnly: true,
  },
  categories: {
    farming: ["Farming Incentives"],
  },
};

export default gmx;
