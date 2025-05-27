import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1745452800;
const totalSupply = 1_000_000_000;

const enshrinedLiquidity = totalSupply * 0.25;
const vipRewards = totalSupply * 0.25;
const investors = totalSupply * 0.1525;
const protocolDev = totalSupply * 0.15;
const foundation = totalSupply * 0.0775;
const binanceLaunch = totalSupply * 0.06;
const airdrop = totalSupply * 0.05;
const echo = totalSupply * 0.01;

const initia: Protocol = {

  "Binance Launch": manualCliff(start, binanceLaunch),
  "Airdrop": manualCliff(start, airdrop),
  "Foundation": [
    manualCliff(start, foundation * 0.5),
    manualStep(
      start,
      periodToSeconds.months(6),
      8,
      (foundation * 0.5) / 8,
    )
  ],
  "Investors": [
    manualCliff(start + periodToSeconds.year, investors * 0.25),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      36,
      (investors * 0.75) / 36,
    ),
  ],

  "Protocol Developers": [
    manualCliff(start + periodToSeconds.year, protocolDev * 0.25),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      36,
      (protocolDev * 0.75) / 36,
    ),
  ],

  "Echo.xyz Community Sale": [
    manualCliff(start + periodToSeconds.months(12), echo * 0.25),
    manualCliff(start + periodToSeconds.months(15), echo * 0.25),
    manualCliff(start + periodToSeconds.months(18), echo * 0.25),
    manualCliff(start + periodToSeconds.months(24), echo * 0.25),
  ],

  "Enshrined Liquidity": manualLinear(
    start,
    start + periodToSeconds.years(250_000_000 / 12_500_000),
    enshrinedLiquidity,
  ),
  "VIP Rewards": manualLinear(
    start,
    start + periodToSeconds.years(250_000_000 / 17_500_000),
    vipRewards,
  ),


  meta: {
    token: "coingecko:initia",
    sources: ["https://docs.initia.xyz/home/core-concepts/init-token/tokenomics#release-schedule"],
    chain: 'initia',
    protocolIds: ["6237"],
    notes: [
      "For VIP Rewards and Enshrined Liquidity we assume it unlock linearly.",
    ]
  },

  categories: {
    insiders: ["Protocol Developers"],
    privateSale: ["Investors"],
    noncirculating: ["Foundation"],
    farming: ["Enshrined Liquidity & Staking Rewards", "VIP Rewards"],
    airdrop: ["Airdrop"],
    publicSale: ["Binance Launch", "Echo.xyz Community Sale"],
  }
};

export default initia;
