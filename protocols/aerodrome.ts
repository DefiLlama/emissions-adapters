import { manualCliff, manualLinear } from "../adapters/manual";
import { latest, supply } from "../adapters/supply";
import { LinearAdapterResult, Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1693267200;
const total = 5e8;
const chain = "base";
const token = "0x940181a94a35a4569e4529a3cdfb74e38fd98631";

const emissions = (percentage: number): LinearAdapterResult[] => {
  const result: LinearAdapterResult[] = [];
  let rate = 0.0175;

  let week = 0;
  let newTotal = total;
  let decay = -0.03;

  while (true) {
    percentage;
    const amount = newTotal * rate;
    result.push({
      type: "linear",
      start: start + periodToSeconds.weeks(week),
      end: start + periodToSeconds.weeks(week + 1),
      amount: (amount * percentage) / 100,
    });
    newTotal *= 1 + rate;
    rate *= 1 - decay;
    week += 1;

    if (week == 14) decay = 0.05;
    if (week == 30) decay = 0.0045;
    if (week == 67) decay = 0.0225;
    if (week > 14 && amount < 9e6) break;
  }

  return result;
};

const aerodrome: Protocol = {
  //   Supply: () => supply(chain, token, start, "aerodrome"),
  //   documented: {
  //     replaces: ["supply"],
  "Voters Incentives": manualCliff(start, total * 0.08),
  "Genesis Liquidity Pool": manualCliff(start, total * 0.02),
  "Airdrop for veAERO Lockers": manualLinear(
    start,
    start + periodToSeconds.years(2),
    total * 0.4,
  ),
  "Ecosystem Pools and Public Goods Funding": manualLinear(
    start,
    start + periodToSeconds.years(2),
    total * 0.21,
  ),
  Team: manualLinear(start, start + periodToSeconds.years(2), total * 0.14),
  "Protocol Grants": manualLinear(
    start,
    start + periodToSeconds.years(2),
    total * 0.1,
  ),
  "AERO Pools Votepower": manualLinear(
    start,
    start + periodToSeconds.years(2),
    total * 0.05,
  ),
  "LP Emissions": emissions(95),
  "Team Emissions": emissions(5),
  //   },
  meta: {
    notes: [
      `Sections Airdrop for veAERO Lockers, Ecosystem Pools and Public Goods Funding, Team, Protocol Grants, and AERO Pools Votepower are distributed in veAERO. veAERO <> AERO conversion can be anywhere 0 - 1 depending on lock duration. At the time of analysis, around half AERO was locked, a year after genesis. We have used extrapolated this rate in our analysis.`,
      `LP Emissions and Team emissions schedules have been estimated based on the chart given in the source data.`,
    ],
    token: `${chain}:${token}`,
    sources: [
      `https://aerodrome.finance/docs#tokenomics`,
      `https://github.com/aerodrome-finance/contracts/blob/main/contracts/Minter.sol#L170-L198`,
    ],
    protocolIds: ["3450", "4524"],
    total,
    incompleteSections: [
      {
        lastRecord: () => latest("aerodrome", start),
        key: "Supply",
        allocation: 2e9,
      },
    ],
  },
  categories: {},
};

export default aerodrome;

// let WEEKLY_DECAY = 9_900;
// let WEEKLY_GROWTH = 10_300;
// let MAX_BPS = 10_000;
// let TAIL_START = 8_969_150 * 1e18;
// let tailEmissionRate = 67;
// let teamRate = 500;
// let weekly = 10_000_000 * 1e18;
// let epochCount = 0;
// let totalSupply = 5e8 * 1e18;

// function main2() {
//   epochCount++;
//   let _emission;

//   if (weekly < TAIL_START) {
//     _emission = (totalSupply * tailEmissionRate) / MAX_BPS;
//   } else {
//     _emission = weekly;
//     if (epochCount < 15) {
//       weekly = (weekly * WEEKLY_GROWTH) / MAX_BPS;
//     } else {
//       weekly = (weekly * WEEKLY_DECAY) / MAX_BPS;
//     }
//   }

//   const _growth = calculateGrowth(_emission);

//   const _rate = teamRate;
//   const _teamEmissions = (_rate * (_growth + weekly)) / (MAX_BPS - _rate);

//   totalSupply = totalSupply += _teamEmissions;
//   return _teamEmissions;
// }

// function calculateGrowth(_minted: number) {
//   let _veTotal = totalSupply * 0.4;
//   let _aeroTotal = totalSupply;

//   return (
//     (((_minted * (_aeroTotal - _veTotal)) / _aeroTotal) *
//       (_aeroTotal - _veTotal)) /
//     _aeroTotal /
//     2
//   );
// }

// async function main() {
//   const emissions = [];
//   let start = 0;
//   let prevSupply = totalSupply;
//   for (let i = 0; i < 52; i++) {
//     main2();
//     emissions.push({
//       type: "linear",
//       start,
//       end: start + periodToSeconds.week,
//       amount: totalSupply - prevSupply,
//     });
//     prevSupply = totalSupply;
//     start += periodToSeconds.week;
//   }
//   return emissions;
// }
