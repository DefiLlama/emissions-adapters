import { Protocol } from "../types/adapters";
import { manualStep, manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 720e6;
const start = 1639785600;
const publicSale = 1595977200;
const mainnet = 1600815600;

const avax: Protocol = {
  "Seed Sale": manualStep(mainnet, periodToSeconds.month * 3, 4, 45e5),
  "Private Sale": manualStep(mainnet, periodToSeconds.month * 3, 4, 249e5 / 4),
  "Public Sale A1": manualStep(
    mainnet,
    periodToSeconds.month * 3,
    4,
    3e6 * 0.6,
  ),
  "Public Sale A2": manualStep(mainnet, periodToSeconds.month * 3, 6, 10e6),
  "Public Sale B": manualCliff(publicSale, 12e6 * 0.4),
  Team: manualStep(mainnet, periodToSeconds.month * 3, 16, 72e6 / 16), // mixed for later hires
  Airdrop: manualStep(mainnet, periodToSeconds.month * 3, 16, 18e6 / 16), // mixed date
  Foundation: manualStep(mainnet, periodToSeconds.month * 3, 40, 1667e3),
  // "Staking Rewards": [],
  "Testnet Incentive Program": manualStep(
    mainnet,
    periodToSeconds.month * 3,
    4,
    486e3,
  ), // qty
  "Community and Dev Endowment": manualStep(
    mainnet,
    periodToSeconds.month * 3,
    4,
    126e5,
  ), //  mixed date
  "Strategic Partners": manualStep(
    mainnet,
    periodToSeconds.month * 3,
    16,
    225e4,
  ), //  mixed date
  meta: {
    notes: [
      `Exact dates for Seed and Private sales couldn't be found, so we've given them the latest dates described.`,
    ],
    sources: [
      "https://web.archive.org/web/20210920192748/https://info.avax.network/",
      "https://medium.com/avalancheavax/avalanche-raises-42m-in-4-5-hours-for-its-first-public-sale-d09362bf3efc",
    ],
    token: "coingecko:avalanche-2",
    protocolIds: [],
  },
  categories: {},
};

export default avax;
