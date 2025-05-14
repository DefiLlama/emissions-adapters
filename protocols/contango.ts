import { Protocol } from "../types/adapters";
import { manualCliff, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1729468800;
const totalSupply = 1_000_000_000;

const team = totalSupply * 0.275;
const investor = totalSupply * 0.119;
const ecosystem = totalSupply * 0.356;
const otangoairdrop = totalSupply * 0.153;
const fixedPriceSale = totalSupply * 0.067;
const alphaDAO = totalSupply * 0.03

const contango: Protocol = {
  "Ecosystem & Treasury": manualCliff(
    start,
    ecosystem,
  ),
  "oTANGO Airdrop": manualCliff(
    start,
    otangoairdrop,
  ),
  "Fixed Price Sale": manualCliff(
    start,
    fixedPriceSale,
  ),
  "Alpha DAO": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    30,
    alphaDAO / 30,
  ),
  "Investors": manualStep(
    start + periodToSeconds.months(6),
    periodToSeconds.month,
    24,
    investor / 24,
  ),
  "Team": manualStep(
    start + periodToSeconds.year,
    periodToSeconds.month,
    30,
    team / 30,
  ),
  meta: {
    token: "coingecko:contango",
    sources: ["https://docs.contango.xyz/tango/allocations-and-unlocking"],
    protocolIds: ["parent#contango"],
    notes: ["Only Team, Investors, and AlphaDAO allocation that have vesting, the rest are unlocked at TGE."],
  },

  categories: {
    privateSale: ["Investors"],
    publicSale: ["Fixed Price Sale"],
    insiders: ["Team"],
    noncirculating: ["Ecosystem & Treasury", "Alpha DAO"],
    airdrop: ["oTANGO Airdrop"],
  }
};

export default contango;
