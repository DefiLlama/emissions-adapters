import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const SUSHI_TOKEN = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2";
const MASTERCHEF = "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd";
const DEV_ADDRESSES = [
  "0xf942dba4159cb61f8ad88ca4a83f5204e8f4a6bd",
  "0xf73b31c07e3f8ea8f7c59ac58ed1f878708c8a76", 
  "0xe94b5eec1fa96ceecbd33ef5baa8d00e4493f4f3",
];
const TRANSFER_TOPIC0 =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ZERO_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const shortAddress = SUSHI_TOKEN.slice(0, 10);
const shortTopic0 = TRANSFER_TOPIC0.slice(0, 10);

const padAddress = (addr: string) =>
  `0x${addr.slice(2).padStart(64, "0")}`.toLowerCase();

const fetchMints = async (
  recipients: string[],
): Promise<CliffAdapterResult[]> => {
  const paddedRecipients = recipients.map(padAddress);
  const inClause = paddedRecipients.map((r) => `'${r}'`).join(", ");
  const data = await queryCustom(
    `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '${shortAddress}' AND short_topic0 = '${shortTopic0}'
    WHERE address = '${SUSHI_TOKEN}'
      AND topic0 = '${TRANSFER_TOPIC0}'
      AND topic1 = '${ZERO_TOPIC}'
      AND topic2 IN (${inClause})
    GROUP BY date
    ORDER BY date ASC
  `,
    {},
  );

  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false,
  }));
};

const farmingSection: SectionV2 = {
  displayName: "Liquidity Mining",
  methodology:
    "Tracks SUSHI minted to MasterChef V1 for LP reward distribution. MasterChef emits sushiPerBlock (100 SUSHI) proportionally across pools by allocPoint.",
  isIncentive: true,
  components: [
    {
      id: "masterchef-farming",
      name: "MasterChef LP Rewards",
      methodology:
        "SUSHI minted from zero address to MasterChef V1 contract, tracked via Transfer events",
      isIncentive: true,
      fetch: () => fetchMints([MASTERCHEF]),
      metadata: {
        contract: SUSHI_TOKEN,
        chain: "ethereum",
        eventSignature: TRANSFER_TOPIC0,
      },
    },
  ],
};

const devFundSection: SectionV2 = {
  displayName: "Development Fund",
  methodology:
    "MasterChef V1 mints 10% of each pool's SUSHI reward to devaddr on every pool update.",
  components: [
    {
      id: "dev-fund",
      name: "Dev Fund Mints",
      methodology:
        "SUSHI minted from zero address to devaddr, tracked via Transfer events.",
      fetch: () => fetchMints(DEV_ADDRESSES),
      metadata: {
        contract: SUSHI_TOKEN,
        chain: "ethereum",
        eventSignature: TRANSFER_TOPIC0,
      },
    },
  ],
};

const sushi: ProtocolV2 = {
  "Liquidity Mining": farmingSection,
  "Development Fund": devFundSection,
  meta: {
    version: 2,
    token: `ethereum:${SUSHI_TOKEN}`,
    sources: [
      "https://www.sushi.com/faq/tokenomics/Tokenomics/what-is-sushi-token",
      "https://etherscan.io/address/0xc2edad668740f1aa35e4d8f227fb8e17dca888cd",
    ],
    protocolIds: ["parent#sushi"],
    notes: [
      "SUSHI has no pre-mine. 100% of supply is minted through MasterChef V1.",
      "MasterChef V1 emits 100 SUSHI/block to LPs + 10% to devaddr (110 total/block).",
    ],
  },
  categories: {
    insiders: ["Development Fund"],
    farming: ["Liquidity Mining"],
  },
};

export default sushi;
