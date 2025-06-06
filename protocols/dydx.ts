import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const schedules: { [date: string]: { [section: string]: number } } = {
  "03/08/2021": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 50309197,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 382762,
    "Safety Staking Pool": 0,
    "Community Treasury": 25457506,
    "Total ": 81135767,
  },
  "31/08/2021": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 0,
    "Community Treasury": 766703,
    "Total ": 6136566,
  },
  "28/09/2021": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 0,
    "Community Treasury": 766703,
    "Total ": 6136566,
  },
  "26/10/2021": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 220171,
    "Community Treasury": 766703,
    "Total ": 6356737,
  },
  "23/11/2021": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 383562,
    "Community Treasury": 766703,
    "Total ": 6520127,
  },
  "21/12/2021": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 383562,
    "Community Treasury": 766703,
    "Total ": 6520127,
  },
  "18/01/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 383562,
    "Community Treasury": 766703,
    "Total ": 6520127,
  },
  "15/02/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 383562,
    "Community Treasury": 766703,
    "Total ": 6520127,
  },
  "15/03/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 383562,
    "Community Treasury": 766703,
    "Total ": 6520127,
  },
  "12/04/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 383562,
    "Community Treasury": 766703,
    "Total ": 6520127,
  },
  "10/05/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 383562,
    "Community Treasury": 766703,
    "Total ": 6520127,
  },
  "07/06/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 383562,
    "Community Treasury": 766703,
    "Total ": 6520127,
  },
  "05/07/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 383562,
    "Community Treasury": 766703,
    "Total ": 6520127,
  },
  "02/08/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 383562,
    "Community Treasury": 766703,
    "Total ": 6520127,
  },
  "30/08/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 3835616,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 383562,
    "Safety Staking Pool": 383562,
    "Community Treasury": 766703,
    "Total ": 6520127,
  },
  "27/09/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 2876712,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 26982,
    "Safety Staking Pool": 383562,
    "Community Treasury": 2082186,
    "Total ": 6520127,
  },
  "25/10/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 2876712,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 383562,
    "Community Treasury": 2109169,
    "Total ": 6520127,
  },
  "22/11/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 2876712,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 83466,
    "Community Treasury": 2409264,
    "Total ": 6520127,
  },
  "20/12/2022": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 2876712,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 2492730,
    "Total ": 6520127,
  },
  "17/01/2023": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 2876712,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 2492730,
    "Total ": 6520127,
  },
  "14/02/2023": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 2876712,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 2492730,
    "Total ": 6520127,
  },
  "14/03/2023": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1582192,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 3787250,
    "Total ": 6520127,
  },
  "11/04/2023": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1582192,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 3787250,
    "Total ": 6520127,
  },
  "09/05/2023": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1582192,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 3787250,
    "Total ": 6520127,
  },
  "06/06/2023": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1582192,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 3787250,
    "Total ": 6520127,
  },
  "04/07/2023": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1582192,
    "Liquidity Provider Rewards": 1150685,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 3787250,
    "Total ": 6520127,
  },
  "01/08/2023": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1582192,
    "Liquidity Provider Rewards": 575343,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 4362592,
    "Total ": 6520127,
  },
  "29/08/2023": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1582192,
    "Liquidity Provider Rewards": 575343,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 4362591,
    "Total ": 6520127,
  },
  "26/09/2023": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1582192,
    "Liquidity Provider Rewards": 575343,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 4362591,
    "Total ": 6520127,
  },
  "21/11/2023": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1582192,
    "Liquidity Provider Rewards": 575343,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 6076765,
    "Total ": 8234301,
  },
  "19/12/2023": {
    Investors: 83188521,
    "Employees & Consultants of dYdX Trading or Foundation": 45811479,
    "Future Employees & Consultants of dYdX Trading or Foundation": 21000000,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 2216237,
    "Liquidity Provider Rewards": 383562,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 3710505,
    "Total ": 156310306,
  },
  "16/01/2024": {
    Investors: 18486338,
    "Employees & Consultants of dYdX Trading or Foundation": 10180329,
    "Future Employees & Consultants of dYdX Trading or Foundation": 4666667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 2073993,
    "Liquidity Provider Rewards": 191781,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 4940970,
    "Total ": 40540077,
  },
  "01/02/2024": {
    Investors: 18486338,
    "Employees & Consultants of dYdX Trading or Foundation": 10180329,
    "Future Employees & Consultants of dYdX Trading or Foundation": 4666667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 849246,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 2713121,
    "Total ": 36895701,
  },
  "01/03/2024": {
    Investors: 18486338,
    "Employees & Consultants of dYdX Trading or Foundation": 10180329,
    "Future Employees & Consultants of dYdX Trading or Foundation": 4666667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1601830,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5117432,
    "Total ": 40052597,
  },
  "01/04/2024": {
    Investors: 18486338,
    "Employees & Consultants of dYdX Trading or Foundation": 10180329,
    "Future Employees & Consultants of dYdX Trading or Foundation": 4666667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 40515994,
  },
  "01/05/2024": {
    Investors: 18486338,
    "Employees & Consultants of dYdX Trading or Foundation": 10180329,
    "Future Employees & Consultants of dYdX Trading or Foundation": 4666667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1657066,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5293896,
    "Total ": 40284296,
  },
  "01/06/2024": {
    Investors: 18486338,
    "Employees & Consultants of dYdX Trading or Foundation": 10180329,
    "Future Employees & Consultants of dYdX Trading or Foundation": 4666667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 40515994,
  },
  "01/07/2024": {
    Investors: 4621585,
    "Employees & Consultants of dYdX Trading or Foundation": 2545082,
    "Future Employees & Consultants of dYdX Trading or Foundation": 1166667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1657066,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5293896,
    "Total ": 15284296,
  },
  "01/08/2024": {
    Investors: 4621585,
    "Employees & Consultants of dYdX Trading or Foundation": 2545082,
    "Future Employees & Consultants of dYdX Trading or Foundation": 1166667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 15515994,
  },
  "01/09/2024": {
    Investors: 4621585,
    "Employees & Consultants of dYdX Trading or Foundation": 2545082,
    "Future Employees & Consultants of dYdX Trading or Foundation": 1166667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 15515994,
  },
  "01/10/2024": {
    Investors: 4621585,
    "Employees & Consultants of dYdX Trading or Foundation": 2545082,
    "Future Employees & Consultants of dYdX Trading or Foundation": 1166667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1657066,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5293896,
    "Total ": 15284296,
  },
  "01/11/2024": {
    Investors: 4621585,
    "Employees & Consultants of dYdX Trading or Foundation": 2545082,
    "Future Employees & Consultants of dYdX Trading or Foundation": 1166667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 15515994,
  },
  "01/12/2024": {
    Investors: 4621585,
    "Employees & Consultants of dYdX Trading or Foundation": 2545082,
    "Future Employees & Consultants of dYdX Trading or Foundation": 1166667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1657066,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5293896,
    "Total ": 15284296,
  },
  "01/01/2025": {
    Investors: 4621585,
    "Employees & Consultants of dYdX Trading or Foundation": 2545082,
    "Future Employees & Consultants of dYdX Trading or Foundation": 1166667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 15515994,
  },
  "01/02/2025": {
    Investors: 4621585,
    "Employees & Consultants of dYdX Trading or Foundation": 2545082,
    "Future Employees & Consultants of dYdX Trading or Foundation": 1166667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 15515994,
  },
  "01/03/2025": {
    Investors: 4621585,
    "Employees & Consultants of dYdX Trading or Foundation": 2545082,
    "Future Employees & Consultants of dYdX Trading or Foundation": 1166667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1546595,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 4940970,
    "Total ": 14820898,
  },
  "01/04/2025": {
    Investors: 4621585,
    "Employees & Consultants of dYdX Trading or Foundation": 2545082,
    "Future Employees & Consultants of dYdX Trading or Foundation": 1166667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 15515994,
  },
  "01/05/2025": {
    Investors: 4621585,
    "Employees & Consultants of dYdX Trading or Foundation": 2545082,
    "Future Employees & Consultants of dYdX Trading or Foundation": 1166666,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1657066,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5293897,
    "Total ": 15284296,
  },
  "01/06/2025": {
    Investors: 4621585,
    "Employees & Consultants of dYdX Trading or Foundation": 2545082,
    "Future Employees & Consultants of dYdX Trading or Foundation": 1166667,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 15515994,
  },
  "01/07/2025": {
    Investors: 2310792,
    "Employees & Consultants of dYdX Trading or Foundation": 1272541,
    "Future Employees & Consultants of dYdX Trading or Foundation": 583333,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1657066,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5293897,
    "Total ": 11117629,
  },
  "01/08/2025": {
    Investors: 2310791,
    "Employees & Consultants of dYdX Trading or Foundation": 1272541,
    "Future Employees & Consultants of dYdX Trading or Foundation": 583333,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 11349328,
  },
  "01/09/2025": {
    Investors: 2310792,
    "Employees & Consultants of dYdX Trading or Foundation": 1272541,
    "Future Employees & Consultants of dYdX Trading or Foundation": 583333,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 11349328,
  },
  "01/10/2025": {
    Investors: 2310791,
    "Employees & Consultants of dYdX Trading or Foundation": 1272541,
    "Future Employees & Consultants of dYdX Trading or Foundation": 583332,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1657066,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5293897,
    "Total ": 11117629,
  },
  "01/11/2025": {
    Investors: 2310792,
    "Employees & Consultants of dYdX Trading or Foundation": 1272541,
    "Future Employees & Consultants of dYdX Trading or Foundation": 583333,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 11349328,
  },
  "01/12/2025": {
    Investors: 2310792,
    "Employees & Consultants of dYdX Trading or Foundation": 1272541,
    "Future Employees & Consultants of dYdX Trading or Foundation": 583333,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1657066,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5293897,
    "Total ": 11117629,
  },
  "01/01/2026": {
    Investors: 2310792,
    "Employees & Consultants of dYdX Trading or Foundation": 1272541,
    "Future Employees & Consultants of dYdX Trading or Foundation": 583333,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 11349328,
  },
  "01/02/2026": {
    Investors: 2310792,
    "Employees & Consultants of dYdX Trading or Foundation": 1272541,
    "Future Employees & Consultants of dYdX Trading or Foundation": 583333,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 11349328,
  },
  "01/03/2026": {
    Investors: 2310792,
    "Employees & Consultants of dYdX Trading or Foundation": 1272541,
    "Future Employees & Consultants of dYdX Trading or Foundation": 583333,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1546595,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 4940970,
    "Total ": 10654231,
  },
  "01/04/2026": {
    Investors: 2310792,
    "Employees & Consultants of dYdX Trading or Foundation": 1272541,
    "Future Employees & Consultants of dYdX Trading or Foundation": 583333,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 11349328,
  },
  "01/05/2026": {
    Investors: 2310792,
    "Employees & Consultants of dYdX Trading or Foundation": 1272541,
    "Future Employees & Consultants of dYdX Trading or Foundation": 583333,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1657066,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5293897,
    "Total ": 11117629,
  },
  "01/06/2026": {
    Investors: 2310792,
    "Employees & Consultants of dYdX Trading or Foundation": 1272541,
    "Future Employees & Consultants of dYdX Trading or Foundation": 583333,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1712301,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5470360,
    "Total ": 11349328,
  },
  "01/07/2026": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1657066,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5293897,
    "Total ": 6950962,
  },
  "08/03/2026": {
    Investors: 0,
    "Employees & Consultants of dYdX Trading or Foundation": 0,
    "Future Employees & Consultants of dYdX Trading or Foundation": 0,
    "Retroactive Rewards": 0,
    "User Trading Rewards": 1857294,
    "Liquidity Provider Rewards": 0,
    "Liquidity Staking Pool": 0,
    "Safety Staking Pool": 0,
    "Community Treasury": 5933576,
    "Total ": 7790870,
  },
  // "TOTALS": {
  //     "Community Treasury": 261133217,
  //     "Total ": 999999992
  // }
};

const rewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const data = await queryCustom(`SELECT
    toStartOfDay(timestamp) AS date,
    SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 67, 64))))) / 1e18 AS amount
FROM evm_indexer.logs
WHERE address IN ('0x5aa653a076c1dbb47cec8c1b4d152444cad91941', '0x01d3348601968ab85b4bb028979006eac235a588', '0x65f7ba4ec257af7c55fd5854e5f6356bbd0fb8ec')
  AND (topic0 = '0x2ef606d064225d24c1514dc94907c134faee1237445c2f63f410cce0852b2054'
  		OR topic0 = '0x8b787e8c8443ad32d7a6d2aed319d9bee901168951fe414912a3968f977c6a29'
  		OR topic0 = '0xfc30cddea38e2bf4d6ea7d3f9ed3b6ad7f176419f4963bd81318067a4aee73fe')
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

const dydx: Protocol = {
  Rewards: rewards,
  meta: {
    sources: [
      "https://docs.dydx.community/dydx-unlimited/start-here/dydx-token-allocation",
    ],
    token: "coingecko:dydx-chain",
    protocolIds: ["parent#dydx", "144", "4067"],
    notes: ["Rewards data are taken from Safety Module, Merkle Distributor and Liquidity Staking claim events"]
  },
  categories: {
    farming: ["Rewards"],
    airdrop: ["Retroactive Rewards"],
    noncirculating: ["Community Treasury"],
    privateSale: ["Investors"],
    insiders: ["Employees & Consultants of dYdX Trading or Foundation","Future Employees & Consultants of dYdX Trading or Foundation"],
  },
};

Object.keys(schedules).map((end: string, i: number) => {
  Object.keys(schedules[end]).map((section: string) => {
    if (section == "Total ") return;
    if (section == "Retroactive Rewards" || section == "User Trading Rewards" || section == "Liquidity Provider Rewards" || section == "Liquidity Staking Pool" || section == "Safety Staking Pool") return;
    if (i == 0)
      dydx[section] = [manualCliff(end, schedules[end][section], "dd/mm/yyyy")];
    else
      dydx[section].push(
        manualLinear(
          Object.keys(schedules)[i - 1],
          end,
          schedules[end][section],
          "dd/mm/yyyy",
        ),
      );
  });
});

export default dydx;
