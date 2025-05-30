import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { CliffAdapterResult, LinearAdapterResult, Protocol } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { periodToSeconds, readableToSeconds } from "../utils/time";

const qty = 100000000;
const start = 1617577200;

const stabilityPool = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`SELECT
    toStartOfDay(timestamp) AS date,
	SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
WHERE (address in ('0x66017d22b0f8556afdd19fc67041899eb65a21bb'))
  AND (topic0 = '0x2608b986a6ac0f6c629ca37018e80af5561e366252ae93602a96d3ab2e73e42d'
       OR topic0 = '0xcd2cdc1a4af71051394e9c6facd9a266b2ac5bd65d219a701eeda009f47682bf')
GROUP BY date
ORDER BY date DESC`, {})

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount)
    });
  }
  return result;
}

const uniLP = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`SELECT
    toStartOfDay(timestamp) AS date,
	SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
FROM evm_indexer.logs
WHERE (address in ('0xd37a77e71ddf3373a79be2ebb76b6c4808bdf0d5'))
  AND (topic0 = '0xe2403640ba68fed3a2f88b7557551d1993f84b99bb10ff833f0cf8db0c5e0486')
GROUP BY date
ORDER BY date DESC`, {})

  for (let i = 0; i < data.length; i++) {
    result.push({
      type: "cliff",
      start: readableToSeconds(data[i].date),
      amount: Number(data[i].amount)
    });
  }
  return result;
}

const liquity: Protocol = {
  "Stability Pool rewards": stabilityPool,
  "Uniswap LPs": uniLP,
  "Community reserve": manualCliff(start, qty * 0.02),
  Endowment: manualCliff(start + periodToSeconds.year, qty * 0.0606),
  "Team and advisors": [
    manualCliff(start + periodToSeconds.year, qty * 0.2665 * 0.25),
    manualStep(
      start + periodToSeconds.year,
      periodToSeconds.month,
      27,
      (qty * 0.2665 * 0.75) / 27,
    ),
  ],
  "Service providers": manualCliff(start + periodToSeconds.year, qty * 0.0104),
  Investors: manualCliff(start + periodToSeconds.year, qty * 0.339),
  meta: {
    sources: ["https://medium.com/liquity/liquity-launch-details-4537c5ffa9ea"],
    token: "ethereum:0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d",
    protocolIds: ["270"],
  },
  categories: {
    farming: ["Stability Pool rewards","Uniswap LPs"],
    noncirculating: ["Endowment","Community reserve"],
    privateSale: ["Investors"],
    insiders: ["Team and advisors","Service providers"],
  },
};
export default liquity;
