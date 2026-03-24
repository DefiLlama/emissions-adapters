import { CliffAdapterResult, Protocol } from "../types/adapters";
import { manualCliff } from "../adapters/manual";
import { balance, latest } from "../adapters/balance";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const total = 100_000_000; // 100 million
const token = "0xba100000625a3754423978a60c9317c58a424e3D";
const chain = "ethereum";

const balanceSection = (address: string, deployed: number, backfill: boolean) =>
  balance([address], token, chain, "balancer", deployed, backfill);

const lpEmissions = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(
    `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3, 64))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = 1 AND short_address = '0xba100000' AND short_topic0 = '0xddf252ad'
    WHERE address = '0xba100000625a3754423978a60c9317c58a424e3d'
      AND topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      AND topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000'
      AND timestamp >= toDateTime('2020-07-01')
    GROUP BY date
    ORDER BY date DESC
  `,
    {},
  );

  const result: CliffAdapterResult[] = [];
  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount),
    });
  }
  return result;
};

const balancer: Protocol = {
  "Liquidity Providers": lpEmissions,
  "Founders, Options, Advisors, Investors": manualCliff(
    1696118400,
    total * 0.225,
  ),
  "Treasury Safe": (backfill: boolean) =>
    balanceSection(
      "0x0EFcCBb9E2C09Ea29551879bd9Da32362b32fc89",
      1618272000,
      backfill,
    ),
  "Balancer Labs Fundraising Fund": (backfill: boolean) =>
    balanceSection(
      "0xB129F73f1AFd3A49C701241F374dB17AE63B20Eb",
      1604192400,
      backfill,
    ),
  "Balancer Labs Contributors Incentives Program": (backfill: boolean) =>
    balanceSection(
      "0xCDcEBF1f28678eb4A1478403BA7f34C94F7dDBc5",
      1592870400,
      backfill,
    ),
  meta: {
    notes: [
      "No information regarding the Founders, Options, Advisors, Investors unlock schedule is given in the source material, other than it had all been vested by Oct 23.",
      "Liquidity Provider emissions are tracked via BAL mint events (Transfer from 0x00) on the BAL token contract.",
    ],
    sources: [
      "https://docs.balancer.fi/concepts/governance/bal-token.html#supply-inflation-schedule",
    ],
    token: "coingecko:balancer",
    protocolIds: ["116", "2611"],
    incompleteSections: [
      {
        key: "Treasury Safe",
        allocation: total * 0.05,
        lastRecord: (backfill: boolean) =>
          latest("balancer", 1618272000, backfill),
      },
      {
        key: "Balancer Labs Fundraising Fund",
        allocation: total * 0.05,
        lastRecord: (backfill: boolean) =>
          latest("balancer", 1604192400, backfill),
      },
      {
        key: "Balancer Labs Contributors Incentives Program",
        allocation: total * 0.025,
        lastRecord: (backfill: boolean) =>
          latest("balancer", 1592870400, backfill),
      },
    ],
  },
  categories: {
    farming: ["Liquidity Providers"],
    noncirculating: ["Treasury Safe"],
    privateSale: [
      "Balancer Labs Fundraising Fund",
      "Balancer Labs Contributors Incentives Program",
    ],
    insiders: ["Founders, Options, Advisors, Investors"],
  },
};

export default balancer;
