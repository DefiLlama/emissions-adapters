import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { readableToSeconds } from "../utils/time";
import { queryCustom } from "../utils/queries";

const FLUID_TOKEN = "0x6f40d4a6237c257fff2db00fa0510deeecd303eb";
const DAO_TREASURY = "0x28849d2b63fa8d361e5fc15cb8abb13019884d09";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const AIRDROP_DISTRIBUTORS = [
  "0x1ba631331503f0486538cb707c6685cbc6b28944",
  "0x6300080a77ffff563b542978555d121ded05b896", 
  "0xac838332afc2937fded89c16a59b2ed8e8e2743c",
];

const shortToken = FLUID_TOKEN.slice(0, 10);
const shortTransfer = TRANSFER_TOPIC.slice(0, 10);
const padAddr = (a: string) => `'0x${a.slice(2).toLowerCase().padStart(64, '0')}'`;
const paddedTreasury = padAddr(DAO_TREASURY);
const paddedDistributors = AIRDROP_DISTRIBUTORS.map(padAddr).join(',');

// Airdrop claims: outflows from distributors excluding returns to treasury
const airdropClaims = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '${shortToken}' AND short_topic0 = '${shortTransfer}'
    WHERE address = '${FLUID_TOKEN}'
      AND topic0 = '${TRANSFER_TOPIC}'
      AND topic1 IN (${paddedDistributors})
      AND topic2 != ${paddedTreasury}
    GROUP BY date
    ORDER BY date ASC`, {});

  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
  }));
};

// Treasury incentives: net outflows excluding inflows from airdrop distributors
const treasuryIncentives = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT date, SUM(amount) AS amount FROM (
      SELECT toStartOfDay(timestamp) AS date,
        reinterpretAsUInt256(reverse(unhex(substring(data, 3)))) / 1e18 AS amount
      FROM evm_indexer.logs
      PREWHERE short_address = '${shortToken}' AND short_topic0 = '${shortTransfer}'
      WHERE address = '${FLUID_TOKEN}'
        AND topic0 = '${TRANSFER_TOPIC}'
        AND topic1 = ${paddedTreasury}
        AND timestamp >= toDateTime('2021-06-16')
      UNION ALL
      SELECT toStartOfDay(timestamp) AS date,
        -reinterpretAsUInt256(reverse(unhex(substring(data, 3)))) / 1e18 AS amount
      FROM evm_indexer.logs
      PREWHERE short_address = '${shortToken}' AND short_topic0 = '${shortTransfer}'
      WHERE address = '${FLUID_TOKEN}'
        AND topic0 = '${TRANSFER_TOPIC}'
        AND topic2 = ${paddedTreasury}
        AND topic1 NOT IN (${paddedDistributors})
        AND timestamp >= toDateTime('2021-06-16')
    )
    GROUP BY date
    ORDER BY date ASC`, {});

  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
  }));
};

const airdropSection: SectionV2 = {
  displayName: "Airdrop",
  methodology: "Tracks claimed INST/FLUID airdrop tokens from the genesis merkle distributors",
  isIncentive: false,
  components: [
    {
      id: "eth-airdrop-claims",
      name: "Ethereum Airdrop Claims",
      methodology: "Tracks FLUID transfers from the 3 genesis airdrop merkle distributors (Compound, Aave, MakerDAO) to users. Excludes returns to DAO treasury.",
      isIncentive: false,
      fetch: airdropClaims,
      metadata: {
        contracts: AIRDROP_DISTRIBUTORS,
        chain: "ethereum",
        chainId: "1",
      },
    },
  ],
};

const communityIncentivesSection: SectionV2 = {
  displayName: "Community Incentives",
  methodology: "Tracks FLUID net outflows from the DAO treasury, which funds farming incentives and ecosystem grants",
  isIncentive: true,
  components: [
    {
      id: "treasury-incentives",
      name: "DAO Treasury Incentives",
      methodology: "Tracks net FLUID outflows from the DAO treasury (0x28849d...). Inflows from airdrop distributors (returned unclaimed tokens) are excluded to avoid double-counting. Buyback inflows are subtracted.",
      isIncentive: true,
      fetch: treasuryIncentives,
      metadata: {
        contract: DAO_TREASURY,
        chain: "ethereum",
        chainId: "1",
      },
    },
  ],
};

const fluid: ProtocolV2 = {
  "Airdrop": airdropSection,
  "Polygon Airdrop": manualCliff("2021-06-16", 1_000_000),
  "Liquidity Mining": manualLinear(
    "2021-06-16",
    "2021-09-16",
    3_000_000
  ),
  "UNI V3 Staking": manualLinear(
    "2021-06-16",
    "2021-09-16",
    1_000_000
  ),
  "Team": manualLinear("2021-07-01", "2025-07-01", 23_794_114),
  "Investors": manualLinear("2021-07-01", "2025-07-01", 12_078_714),
  "Future Team & Ecosystem": manualLinear("2021-07-01", "2025-07-01", 7_851_941),
  "Advisors": manualLinear("2021-07-01", "2025-07-01", 1_275_231),
  "Community Incentives": communityIncentivesSection,

  meta: {
    version: 2,
    sources: [
      "https://blog.instadapp.io/inst/",
      "https://github.com/Instadapp/fluid-contracts-public/blob/main/deployments/deployments.md",
      "https://gov.fluid.io/t/return-unclaimed-airdropped-inst-to-governance-treasury/392"
    ],
    token: `ethereum:${FLUID_TOKEN}`,
    protocolIds: ["parent#fluid"],
    notes: [
      "INST token was rebranded to FLUID, no allocations changed",
      "40M community allocation sent to DAO treasury at TGE, distributed over time",
      "Airdrop tracks actual claims from genesis merkle distributors",
      "~8.61M unclaimed airdrop tokens were returned to the DAO treasury",
      "Community Incentives tracks treasury net outflows excluding airdrop distributor returns to avoid double-counting",
    ]
  },
  categories: {
    insiders: ["Team", "Investors", "Future Team & Ecosystem", "Advisors"],
    airdrop: ["Airdrop", "Polygon Airdrop"],
    farming: ["Liquidity Mining", "UNI V3 Staking", "Community Incentives"],
  }
};

export default fluid;
