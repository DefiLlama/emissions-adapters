import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { manualCliff } from "../adapters/manual";
import { queryCustom, queryDailyNetOutflows, queryDailyOutflows } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const total = 100_000_000; // 100 million
const token = "0xba100000625a3754423978a60c9317c58a424e3d";

const lpEmissions = async (): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(
    `
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3, 64))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = 1 AND short_address = '${token.slice(0,10)}' AND short_topic0 = '0xddf252ad'
    WHERE address = '${token}'
      AND topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      AND topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000'
      AND timestamp >= toDateTime('2020-06-23')
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

const incentivesSection: SectionV2 = {
  displayName: "Liquidity Providers",
  methodology: "Tracks BAL tokens distributed to liquidity providers",
  isIncentive: true,
  components: [
    {
      id: "liquidity-providers",
      name: "Liquidity Providers",
      methodology: "Tracks new mints of BAL that are used to incentivize liquidity providers.",
      isIncentive: true,
      fetch: lpEmissions,
      metadata: {
        contract: '0xba100000625a3754423978a60c9317c58a424e3d',
        chains: ["ethereum"],
      },
    },
  ],
};

async function getNetOutflows(address: string) {
    const data = await queryDailyNetOutflows({
      token: token,
      address: address,
      startDate: "2020-07-01"
    })
    return data.map(d => ({
      type: "cliff" as const,
      start: readableToSeconds(d.date),
      amount: Number(d.amount),
    }))
}

async function getOutflows(address: string, startDate: string) {
    const data = await queryDailyOutflows({
      token: token,
      fromAddress: address,
      startDate,
    })
    return data.map(d => ({
      type: "cliff" as const,
      start: readableToSeconds(d.date),
      amount: Number(d.amount),
    }))
}

const balancer: ProtocolV2 = {
  "Liquidity Providers": incentivesSection,
  "Founders, Options, Advisors, Investors": manualCliff(
    1696118400,
    total * 0.225,
  ),
  "Treasury Safe": () => getOutflows(
       "0x0EFcCBb9E2C09Ea29551879bd9Da32362b32fc89",
       "2025-07-25"
     ),
  "Balancer Labs Fundraising Fund": () => getNetOutflows(
      "0xB129F73f1AFd3A49C701241F374dB17AE63B20Eb",
    ),
  "Balancer Labs Contributors Incentives Program": () => getNetOutflows(
      "0xCDcEBF1f28678eb4A1478403BA7f34C94F7dDBc5",
    ),
  meta: {
    version: 2,
    notes: [
      "No information regarding the Founders, Options, Advisors, Investors unlock schedule is given in the source material, other than it had all been vested by Oct 23.",
      "Liquidity Provider emissions are tracked via BAL mint events (Transfer from 0x00) on the BAL token contract.",
    ],
    sources: [
      "https://docs.balancer.fi/concepts/governance/bal-token.html#supply-inflation-schedule",
    ],
    token: "coingecko:balancer",
    protocolIds: ["parent#balancer"],
    total
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
