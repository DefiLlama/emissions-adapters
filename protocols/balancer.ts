import { Protocol } from "../types/adapters";
import { manualCliff } from "../adapters/manual";
import { balance, latest } from "../adapters/balance";

const total = 100_000_000; // 100 million
const token = "0xba100000625a3754423978a60c9317c58a424e3D";
const chain = "ethereum";

const balanceSection = (address: string, deployed: number, backfill: boolean) =>
  balance([address], token, chain, "balancer", deployed, backfill);

const balancer: Protocol = {
  "Liquidity Providers": (backfill: boolean) =>
    balanceSection(
      "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
      1618876800,
      backfill,
    ),
  "Founders, Options, Advisors, Investors": manualCliff(
    1696118400,
    total * 0.225,
  ),
  Ecosystem: (backfill: boolean) =>
    balanceSection(
      "0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f",
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
    ],
    sources: [
      "https://docs.balancer.fi/concepts/governance/bal-token.html#supply-inflation-schedule",
    ],
    token: "coingecko:balancer",
    protocolIds: ["116", "2611"],
    incompleteSections: [
      {
        key: "Liquidity Providers",
        allocation: total * 0.65,
        lastRecord: (backfill: boolean) =>
          latest("balancer", 1618876800, backfill),
      },
      {
        key: "Ecosystem",
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
    noncirculating: ["Ecosystem"],
    privateSale: [
      "Balancer Labs Fundraising Fund",
      "Balancer Labs Contributors Incentives Program",
    ],
    insiders: ["Founders, Options, Advisors, Investors"],
  },
};

export default balancer;
