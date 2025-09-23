import { manualCliff } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const tgeTimestamp = 1745416800;

const totalSupply = 10_000_000_000;
const claimDayOfMonth = 30;

const createMonthlyCliffSchedule = (
  originTimestamp: number,
  cliffMonths: number,
  periods: number,
  amountPerPeriod: number,
) => {
  const origin = new Date(originTimestamp * 1000);
  const hours = origin.getUTCHours();
  const minutes = origin.getUTCMinutes();
  const seconds = origin.getUTCSeconds();
  const baseYear = origin.getUTCFullYear();
  const baseMonth = origin.getUTCMonth() + cliffMonths;

  const schedule: ReturnType<typeof manualCliff>[] = [];

  for (let i = 0; i < periods; i++) {
    const monthIndex = baseMonth + i;
    const year = baseYear + Math.floor(monthIndex / 12);
    const month = monthIndex % 12;
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const day = Math.min(claimDayOfMonth, daysInMonth);

    const timestamp = Math.floor(
      Date.UTC(year, month, day, hours, minutes, seconds) / 1000,
    );

    schedule.push(manualCliff(timestamp, amountPerPeriod));
  }

  return schedule;
};

const incentivesAllocation = totalSupply * 0.20;
const airdropAllocation = totalSupply * 0.10;
const liquidityAllocation = totalSupply * 0.05;
const treasuryAllocation = totalSupply * 0.20;
const teamAllocation = totalSupply * 0.189;
const investorsAllocation = totalSupply * 0.261;


const zora: Protocol = {
  "Retroactive Airdrop": manualCliff(tgeTimestamp, airdropAllocation),
  "Community Incentives": manualCliff(tgeTimestamp, incentivesAllocation),
  "Ecosystem Liquidity": manualCliff(tgeTimestamp, liquidityAllocation),
  "Team": createMonthlyCliffSchedule(tgeTimestamp, 6, 36, teamAllocation / 36),
  "Investors": createMonthlyCliffSchedule(
    tgeTimestamp,
    6,
    36,
    investorsAllocation / 36,
  ),
  "Treasury": createMonthlyCliffSchedule(tgeTimestamp, 6, 48, treasuryAllocation / 48),

  meta: {
    notes: [
      "Allocations described as 'Not subject to lockup restrictions' (Incentives, Airdrop, Liquidity) are modeled as fully unlocked at TGE using manualCliff.",
      "Treasury, Team, and Investors unlocks start 6 months post-TGE and occur on the last available day up to the 30th of each month (February adjusts to month-end), as per confirmed by team.",
    ],
    sources: ["https://support.zora.co/en/articles/4797185"],
    token: `base:0x1111111111166b7fe7bd91427724b487980afc69`,
    protocolIds: ["parent#zora"],
  },
  categories: {
    farming: ["Community Incentives"],
    airdrop: ["Retroactive Airdrop"],
    liquidity: ["Ecosystem Liquidity"],
    noncirculating: ["Treasury"],
    privateSale: ["Investors"],
    insiders: ["Team"],
  }
};

export default zora;
