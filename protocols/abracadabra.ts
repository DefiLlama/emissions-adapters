import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom, toShort } from "../utils/queries";
import { readableToSeconds, years } from "../utils/time";

const start = 1621206000;
const qty = 210000000000;
const SPELL_ETH = "0x090185f2135308bad17527004364ebcc2d37e5f6";
const TRANSFER =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ZERO_TOPIC =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const BURN_TOPIC = `0x${SPELL_ETH.slice(2).padStart(64, "0")}`;
const TEAM_TOPIC =
  "0x0000000000000000000000005a7c5505f3cfb9a0d9a8493ec41bf27ee48c406d";
const IDO_TOPIC =
  "0x0000000000000000000000008a7f7c5b556b1298a74c0e89df46eba117a2f6c1";

const TEAM_WALLET = "0x5a7c5505f3cfb9a0d9a8493ec41bf27ee48c406d";
const CURVE_POOL = "0xd8b712d29381748db89c36bca0138d7c75866ddf";
const CURVE_GAUGE_BRIDGE = "0x7893bbb46613d7a4fbcc31dab4c9b823ffee1026";

const spellMintsEth = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(
    `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '1'
      AND short_address = '${toShort(SPELL_ETH)}'
      AND short_topic0 = '${toShort(TRANSFER)}'
    WHERE address = '${SPELL_ETH}'
      AND topic0 = '${TRANSFER}'
      AND topic1 = '${ZERO_TOPIC}'
      AND topic2 NOT IN ('${BURN_TOPIC}', '${TEAM_TOPIC}', '${IDO_TOPIC}')
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

const teamWalletToCurve = async (): Promise<CliffAdapterResult[]> => {
  const curvePoolTopic = `0x${CURVE_POOL.slice(2).padStart(64, "0")}`;
  const curveGaugeTopic = `0x${CURVE_GAUGE_BRIDGE.slice(2).padStart(64, "0")}`;
  const teamTopic = `0x${TEAM_WALLET.slice(2).padStart(64, "0")}`;
  const data = await queryCustom(
    `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '1'
      AND short_address = '${toShort(SPELL_ETH)}'
      AND short_topic0 = '${toShort(TRANSFER)}'
    WHERE address = '${SPELL_ETH}'
      AND topic0 = '${TRANSFER}'
      AND topic1 = '${teamTopic}'
      AND topic2 IN ('${curvePoolTopic}', '${curveGaugeTopic}')
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

const incentivesSection: SectionV2 = {
  displayName: "SPELL Incentives",
  methodology:
    "Tracks SPELL incentive emissions from two sources: direct mints to incentive addresses, and team treasury distributions to Curve farming contracts.",
  isIncentive: true,
  components: [
    {
      id: "spell-mints",
      name: "SPELL Emissions",
      methodology:
        "Tracks SPELL minted on Ethereum for farming incentives, Votium bribes, and staking rewards. Excludes mints to team wallet, IDO wallet, and burn address.",
      isIncentive: true,
      fetch: spellMintsEth,
      metadata: {
        contract: SPELL_ETH,
        chain: "ethereum",
        eventSignature: TRANSFER,
      },
    },
    {
      id: "spell-curve-incentives",
      name: "Curve Incentives",
      methodology:
        "Tracks SPELL distributed from the team treasury to the Curve MIM pool and Curve gauges bridge for LP and gauge incentives.",
      isIncentive: true,
      fetch: teamWalletToCurve,
      metadata: {
        contract: CURVE_POOL,
        chain: "ethereum",
        eventSignature: TRANSFER,
      },
    },
  ],
};

const abracadabra: ProtocolV2 = {
  IDO: manualCliff(start, qty * 0.07),
  Team: manualLinear(start, years(start, 4), qty * 0.3),
  "SPELL Incentives": incentivesSection,
  meta: {
    version: 2,
    token: `ethereum:${SPELL_ETH}`,
    sources: ["https://docs.abracadabra.money/learn/tokens/tokenomics"],
    protocolIds: ["parent#abracadabra"],
    notes: [
      "SPELL incentive emission rates are decided by governance and minted on-chain.",
      "Tracks mints from zero address (excl. team, IDO, burn) plus team treasury distributions to Curve farming contracts.",
    ],
  },
  categories: {
    insiders: ["Team"],
    publicSale: ["IDO"],
    farming: ["SPELL Incentives"],
  },
};

export default abracadabra;
