import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const start = 1592438400;

const privateSale1Amount = 276_000_000;
const privateSale2Amount = 50_000_000;
const privateSale3Amount = 34_000_000;
const publicSaleICOAmount = 224_000_000;
const web3FoundationAmount = 300_000_000;
const preminedRewardsAmount = 116_000_000;

const annualInflation = 120_000_000;
const stakerAnnualInflation = annualInflation * 0.85;
const treasuryAnnualInflation = annualInflation * 0.15;

const modelEndDate = start + periodToSeconds.years(10);
const totalStakerInflationModelled = stakerAnnualInflation * 10;
const totalTreasuryInflationModelled = treasuryAnnualInflation * 10;

const polkadot: Protocol = {
  "Private Sale 1": manualCliff(start, privateSale1Amount),
  "Private Sale 2": manualCliff(start, privateSale2Amount),
  "Private Sale 3": manualCliff(start, privateSale3Amount),
  "Public Sale (ICO)": manualCliff(start, publicSaleICOAmount),
  "Web3 Foundation": manualCliff(start, web3FoundationAmount),
  "Premined Rewards & Airdrops": manualCliff(start, preminedRewardsAmount),

  "Staking Rewards": manualLinear(
    start,
    modelEndDate,
    totalStakerInflationModelled
  ),
  "Treasury": manualLinear(
    start,
    modelEndDate,
    totalTreasuryInflationModelled
  ),

  meta: {
    notes: [
      "Polkadot's initial supply is 1B DOT post-redenomination.",
      "Vesting details for initial allocations (Sales, Web3 Foundation, Premined) are largely unspecified in public sources.",
      "Assumed all initial tokens are unlocked when inflation starts.",
      "Polkadot has ongoing inflation (120M DOT/year fixed gross rate) starting from the PoS transition (June 18, 2020).",
      "Ongoing inflation for Staking Rewards (85%) and Treasury (15%) is modelled over a 10-year period.",
    ],
    sources: [
      "https://wiki.polkadot.network/learn/learn-inflation/",
      "https://icodrops.com/polkadot/",
    ],
    token: "coingecko:polkadot",
    protocolIds: ["5978"],
    chain: "polkadot"
  },
  categories: {
    publicSale: ["Public Sale (ICO)"],
    noncirculating: ["Premined Rewards & Airdrops","Web3 Foundation","Treasury"],
    farming: ["Staking Rewards"],
    privateSale: ["Private Sale 1","Private Sale 2","Private Sale 3"],
  },
};

export default polkadot;