import { manualCliff, manualStep, manualLinear, manualLog } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1636156800; // 05 Nov 2021
const end = start + periodToSeconds.year * 4; // 31 Oct 2025
const periodLength = periodToSeconds.month; 

const ecosystemDevelopment = manualLog(
  start,
  end,
  1_034_461_000,
  periodLength,
  0.10, 
  true
);

const projectDevelopment = [
  manualCliff(start + 12 * periodToSeconds.month, 0), 
  manualStep(
    start + 12 * periodToSeconds.month,
    periodToSeconds.month,
    36,
    500_000_000 / 36
  )
];

const privateSale = [
  manualCliff(start + 12 * periodToSeconds.month, 0), 
  manualStep(
    start + 12 * periodToSeconds.month,
    periodToSeconds.month,
    20,
    277_139_000 / 20
  )
];

const publicSale1 = manualStep(start, periodToSeconds.month, 3, 58_800_000 / 3);
const publicSale2 = manualStep(start, periodToSeconds.month, 6, 49_600_000 / 6);

const immutable: Protocol = {
  "Ecosystem Development": ecosystemDevelopment,
  "Project Development": projectDevelopment,
  "Private Sale": privateSale,
  "Public Sale 1": publicSale1,
  "Public Sale 2": publicSale2,
  "Foundation Reserve": manualCliff(start, 80_000_000),

  meta: {
    token: "ethereum:0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF",
    sources: [
      "https://www.digitalworldsnfts.com/imx-token",
      "https://assets.website-files.com/646557ee455c3e16e4a9bcb3/646557ee455c3e16e4a9be87_Immutable%20X%20Whitepaper.pdf",
      "https://twitter.com/0xferg/status/1714270599214981164"
    ],
    protocolIds: ["3139"],
  },
  categories: {
    farming: ["Ecosystem Development"],
    publicSale: ["Public Sale 1","Public Sale 2"],
    noncirculating: ["Foundation Reserve"],
    privateSale: ["Private Sale"],
    insiders: ["Project Development"],
  },
};

export default immutable;
