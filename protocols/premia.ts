import { balance, latest } from "../adapters/balance";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const qty = 100000000;
const renewedEnd = 1828828800;
const jan23 = 1673744400;
const jul23 = 1689379200;
const aug27 = 1818288000;
const chain = "ethereum";
const target = "0x6399C842dD2bE3dE30BF99Bc7D1bBF6Fa3650E70";
const dao = 1675555200;

const premia: Protocol = {
  "Previously Distributed": manualCliff(jan23, qty * 0.32078004),
  Unallocated: manualCliff(jan23, qty * 0.225),
  // "Bootstrap Distribution": manualCliff(jan23, qty * 0.1),
  // "Development Grants": () =>
  //   balance(
  //     ["0xee710f7b6ec3da7f5d9be1fe1e15a9503c59a16b"],
  //     target,
  //     chain,
  //     "premia",
  //     dao,
  //   ),
  // "Marketing & Partnerships": () =>
  //   balance(
  //     [
  //       "0x22b62a85a2a8f8812b7aac2b873e0227dd0c2125",
  //       "0x1e9f88f87aba3da62bed1a12f4122a6f73a51798",
  //     ],
  //     target,
  //     chain,
  //     "premia",
  //     dao,
  //   ),
  Operators: manualLinear(jan23, jan23 + periodToSeconds.year * 4, qty * 0.1),
  Founders: manualLinear(jan23, jan23 + periodToSeconds.year * 4, qty * 0.1),
  "Blue Descent DAO": manualLinear(
    jan23,
    jan23 + periodToSeconds.year * 4,
    qty * 0.1,
  ),
  Partners: manualLinear(jan23, jan23 + periodToSeconds.year * 4, qty * 0.02),
  "V3 Liquidity Mining": manualLinear(jul23, aug27, qty * 0.08),
  AirDrip: manualLinear(
    jul23 + periodToSeconds.year,
    jul23 + periodToSeconds.year * 2,
    qty * 0.02,
  ),
  Team: manualLinear(1725145200, renewedEnd, 3421996),
  meta: {
    notes: [
      "In Jan 2024 tokenomics were revised with respect to the spreadsheet listed in sources",
      // "1.3m PREMIA of the Operator Developer Fund, 16m Liquidity Mining Rewards, 1.5m Conditional, and 3.7m Team, has not been allocated yet and therefore has been excluded from this analysis (22.5% total supply)",
      "There is no documented release schedule for 22.5% of PREMIA Supply, as it is unallocated, as per the spreadsheet source",
      "There is no documented release schedule for the 32% of PREMIA Supply released before the Jan 2024 tokenomics review",
    ],
    token: `${chain}:${target}`,
    sources: [
      "https://docs.premia.finance/metaeconomy/meta-economic-essentials/premia-tokenomics",
      "https://docs.google.com/spreadsheets/d/1YEPAZ9tkCFTZaslADl72CYvHmZ3JjIQCquFr9dkRq9s",
    ],
    protocolIds: ["381"],
    // incompleteSections: [
    //   {
    //     key: "Development Grants",
    //     allocation: qty * 0.02,
    //     lastRecord: () => latest("premia", dao),
    //   },
    //   {
    //     key: "Marketing & Partnerships",
    //     allocation: qty * 0.0956,
    //     lastRecord: () => latest("premia", dao),
    //   },
    // ],
  },
  categories: {
    insiders: [
      "Operators",
      "Founders",
      "Blue Descent DAO",
      "Partners",
      "Team",
      // "Marketing & Partnerships",
      // "Development Grants",
    ],
    farming: [
      //"Bootstrap Distribution",
      "V3 Liquidity Mining",
      "AirDrip",
    ],
  },
};

export default premia;
