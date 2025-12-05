import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { Protocol } from "../types/adapters";

const launch = 1505606400;
const foundationUnlockDate = 1577836800;
const emissionStartDate = 1609459200;
const emissionEndDate = emissionStartDate + periodToSeconds.years(15)

const initialSupplyBase = 100_000_000_000;

const privateSaleAmount = initialSupplyBase * 0.257;
const icoAmount = initialSupplyBase * 0.40;
const tronFoundationAmount = (initialSupplyBase * 0.343) - 1_000_000_000; // 1B TRX is burned at launch

const dailyEmissionRate = 5_068_800; // TRX per day (Block + Voting rewards) (Calculated from approx 28800 blocks per day * (16 + 160))

const tron: Protocol = {
  "Public Sale": manualCliff(launch, icoAmount),
  "Private Sale": manualCliff(launch, privateSaleAmount),
  "Tron Foundation": manualCliff(foundationUnlockDate, tronFoundationAmount),
  "Network Rewards": manualLinear(
    emissionStartDate,
    emissionStartDate + periodToSeconds.years(15),
    dailyEmissionRate * ( (emissionEndDate - emissionStartDate) / periodToSeconds.day)
  ),

  meta: {
    notes: [
      "Public Sale and Private Sale are assumed to be unlocked at launch.",
      "Network Rewards are combination of block rewards and voting rewards.",
      "Ongoing Network Rewards (Emissions) started Jan 1, 2021, at a rate of approximately 5.07 million TRX per day (block + voting rewards). Where before it was awarded by the Tron Foundation.",
      "Ongoing emissions are modeled up to 15-year period due to their indefinite nature. The rate is derived from the documented daily emission.",
      "The total supply of TRX is dynamic due to ongoing emissions and burning mechanisms (e.g., for USDD minting). Burning is not modeled.",
      "The emission rate is based on documentation from May 2023 and assumed constant.",
    ],
    sources: [
      "https://www.binance.com/en/research/projects/tron",
      "https://medium.com/tron-foundation/33-251-807-424-trx-were-locked-in-1000-addresses-of-tron-mainnet-366b392c94eb"
      
    ],
    token: `coingecko:tron`,
    protocolIds: ["6103"],
    chain: "tron"
  },
  categories: {
    publicSale: ["Public Sale"],
    farming: ["Network Rewards"],
    privateSale: ["Private Sale"],
    insiders: ["Tron Foundation"],
  }
};

export default tron;