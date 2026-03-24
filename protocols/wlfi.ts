import { manualCliff } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const tge = 1756684800; // 2025-09-01
const total = 100_000_000_000;
const token = "ethereum:0xda5e1988097297dcdc1f90d4dfe7909e847cbef6";

const shares = {
  ecosystem: total * 0.1,
  alt5: total * 0.0778358565,
  liquidity: total * 0.02880884615,
  publicSale: total * 0.20023,
  treasury: total * 0.1995503,
  cofounder: total * 0.3,
  team: total * 0.03507,
  partners: total * 0.05850499736,
};

const LOCKBOX = "0x74b4f6a2e579d730aacb9dd23cfbbaeb95029583";
const CLAIM_TOPIC =
  "0xd8138f8a3f377c5259ca548e70e4c2de94f129f5a11036a15b69513cba2b426a";

type EmissionRow = { date: string; amount: string };

const lockboxClaims = async (): Promise<CliffAdapterResult[]> => {
  const data = (await queryCustom(
    `SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE short_address = '${LOCKBOX.slice(0, 10)}'
      AND short_topic0 = '${CLAIM_TOPIC.slice(0, 10)}'
    WHERE address = '${LOCKBOX}'
      AND topic0 = '${CLAIM_TOPIC}'
      AND timestamp >= toDateTime('2025-09-01')
    GROUP BY date
    ORDER BY date ASC`,
    {},
  )) as EmissionRow[];

  return data.map((d) => ({
    type: "cliff",
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
  }));
};

const publicSaleSection: SectionV2 = {
  displayName: "Public Sale",
  methodology:
    "All public sale tokens (20.023%) flow through the WLFI Lockbox contract. 20% unlocked at TGE, remaining 80% subject to governance vote.",
  components: [
    {
      id: "lockbox-claims",
      name: "Lockbox Claims",
      methodology:
        "On-chain claim events from the Lockbox proxy contract on Ethereum.",
      fetch: lockboxClaims,
      metadata: {
        contract: LOCKBOX,
        chain: "ethereum",
        chainId: "1",
        eventSignature: CLAIM_TOPIC,
      },
    },
  ],
};

const treasurySection: SectionV2 = {
  displayName: "Treasury",
  methodology: "Protocol treasury. Vesting schedule TBD.",
  isTBD: true,
  components: [
    {
      id: "treasury",
      name: "Treasury",
      methodology: "19.955% of total supply. Vesting schedule TBD.",
      isTBD: true,
      fetch: async () => [manualCliff(tge, shares.treasury)],
    },
  ],
};

const teamSection: SectionV2 = {
  displayName: "Team",
  methodology: "Team allocation. Vesting schedule TBD.",
  isTBD: true,
  components: [
    {
      id: "team",
      name: "Team",
      methodology: "3.507% of total supply. Vesting schedule TBD.",
      isTBD: true,
      fetch: async () => [manualCliff(tge, shares.team)],
    },
  ],
};

const cofounderSection: SectionV2 = {
  displayName: "Co-Founder",
  methodology: "Co-Founder allocation for DT Marks, AMG, and WC Digital Fi, LLC. Vesting schedule TBD.",
  isTBD: true,
  components: [
    {
      id: "cofounder",
      name: "Co-Founder",
      methodology: "30% of total supply. Vesting schedule TBD.",
      isTBD: true,
      fetch: async () => [manualCliff(tge, shares.cofounder)],
    },
  ],
};

const partnersSection: SectionV2 = {
  displayName: "Strategic Partners",
  methodology: "Strategic Partners allocation. Vesting schedule TBD.",
  isTBD: true,
  components: [
    {
      id: "partners",
      name: "Strategic Partners",
      methodology: "5.85% of total supply. Vesting schedule TBD.",
      isTBD: true,
      fetch: async () => [manualCliff(tge, shares.partners)],
    },
  ],
};

const wlfi: ProtocolV2 = {
  "Ecosystem Development": manualCliff(tge, shares.ecosystem),
  "Alt5 Sigma": manualCliff(tge, shares.alt5),
  "Liquidity & Marketing": manualCliff(tge, shares.liquidity),
  "Public Sale": publicSaleSection,
  Treasury: treasurySection,
  Team: teamSection,
  "Strategic Partners": partnersSection,
  "Co-Founder": cofounderSection,
  meta: {
    version: 2,
    token,
    sources: [
      "https://docs.worldlibertyfinancial.com/wlfi-token/tokenomics",
      "https://docs.worldlibertyfinancial.com/wlfi-token/contract-addresses",
      "https://medium.com/@wlfi/understanding-the-wlfi-circulating-supply-at-launch-061f904e6923",
    ],
    protocolIds: ["7571"],
    total,
    notes: [
      "Treasury, Team and Strategic Partners and Co-Founder vesting schedules are TBD per official documentation.",
      "Founders, team, advisors, and partners are explicitly excluded from the initial unlock.",
      "All public sale tokens (20.023%) flow through the WLFI Lockbox contract. 20% unlocked at TGE, remaining 80% subject to governance vote."
    ],
  },
  categories: {
    insiders: ["Team", "Co-Founder"],
    publicSale: ["Public Sale"],
    noncirculating: ["Treasury", "Ecosystem Development"],
    privateSale: ["Strategic Partners", "Alt5 Sigma"],
    liquidity: ["Liquidity & Marketing"],
  },
};

export default wlfi;
