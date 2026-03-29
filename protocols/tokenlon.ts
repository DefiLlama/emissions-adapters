import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const LON_TOKEN = "0x0000000000095413afc295d19edeb1ad7b71c952";
const MERKLE_REDEEM = "0x0000000006a0403952389b70d8ee4e45479023db";

const CLAIMED_SIG = "0xd8138f8a3f377c5259ca548e70e4c2de94f129f5a11036a15b69513cba2b426a";

const miningRewards = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '1' AND short_address = '${MERKLE_REDEEM.slice(0, 10)}' AND short_topic0 = '${CLAIMED_SIG.slice(0, 10)}'
    WHERE topic0 = '${CLAIMED_SIG}'
      AND address = '${MERKLE_REDEEM}'
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

const incentivesSection: SectionV2 = {
  displayName: "LON Incentives",
  methodology: "Tracks LON token distributions to users through mining programs",
  isIncentive: true,
  components: [
    {
      id: "mining-rewards",
      name: "Mining Rewards",
      methodology: "Tracks LON claimed from MerkleRedeem contract. Users earn LON through liquidity mining programs.",
      isIncentive: true,
      fetch: miningRewards,
      metadata: {
        contract: "0x0000000006a0403952389b70d8ee4e45479023db",
        chain: "ethereum",
        chainId: "1",
        eventSignature: CLAIMED_SIG,
      },
    },
  ],
};

const tokenlon: ProtocolV2 = {
  "Incentives": incentivesSection,

  meta: {
    version: 2,
    token: `ethereum:${LON_TOKEN}`,
    sources: [
      "https://etherscan.io/address/0x0000000006a0403952389b70d8ee4e45479023db",
    ],
    protocolIds: ["parent#tokenlon"],
    notes: [
      "Mining rewards distributed via MerkleRedeem (Claimed events)",
      "Only mining rewards are tracked"
    ],
    incentivesOnly: true
  },

  categories: {
    farming: ["Incentives"],
  },
};

export default tokenlon;
