import { Protocol } from "../types/adapters";
import { manualStep, manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { time } from "../adapters/avax";
const publicSale = 1595977200;
const mainnet = 1600815600 + periodToSeconds.month + periodToSeconds.day;

const avax: Protocol = {
  // All: time(),
  // documented: {
    // replaces: ["All"],
    "Seed Sale": manualStep(mainnet, periodToSeconds.month * 3, 4, 45e5),
    "Private Sale": manualStep(
      mainnet,
      periodToSeconds.month * 3,
      4,
      249e5 / 4,
    ),
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
    "Staking Rewards": manualLinear(
      mainnet,
      mainnet + periodToSeconds.day * 6000,
      360e6,
    ), // as measured on 20/06/23
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
  // },
  meta: {
    notes: [
      `Exact dates for Seed and Private sales couldn't be found, so we've given them the latest dates described.`,
      `Staking reward unlocks depend on the amount of AVAX staked. Since this can't be predicted, we have extrapolated the past rate of rewards.`,
      `Realtime data represents data from an xchain genesis file.`,
    ],
    sources: [
      "https://web.archive.org/web/20210920192748/https://info.avax.network/",
      "https://medium.com/avalancheavax/avalanche-raises-42m-in-4-5-hours-for-its-first-public-sale-d09362bf3efc",
    ],
    token: "coingecko:avalanche-2",
    protocolIds: ["3140"],
  },
  categories: {},
};

export default avax;
