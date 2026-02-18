import { getEmissionsV2 } from "../adapters/aerodrome";
import { manualCliff, manualLinear } from "../adapters/manual";
import { latest } from "../adapters/supply";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1693267200;
const total = 5e8;
const chain = "base";
const token = "0x940181a94a35a4569e4529a3cdfb74e38fd98631";

const aerodrome: Protocol = {
  // Supply: () => supply(chain, token, start, "aerodrome"),
  // documented: {
  //   replaces: ["supply"],
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
  "Gauge Emissions": () => getEmissionsV2("gauge"),
  "Rebase Emissions": () => getEmissionsV2("rebase"),
  //   },
  meta: {
    notes: [
      `After Epoch 67, emissions will be dependent on the AERO FED`,
      `Sections Airdrop for veAERO Lockers, Ecosystem Pools and Public Goods Funding, Team, Protocol Grants, and AERO Pools Votepower are distributed in veAERO. veAERO <> AERO conversion can be anywhere 0 - 1 depending on lock duration. At the time of analysis, around half AERO was locked, a year after genesis. We have used extrapolated this rate in our analysis.`,
      `Emissions data is fetched from Dune Analytics (query 6160942) which provides epoch-based minting data.`,
    ],
    token: `${chain}:${token}`,
    sources: [
      `https://aerodrome.finance/docs#tokenomics`,
      `https://github.com/aerodrome-finance/contracts/blob/main/contracts/Minter.sol#L170-L198`,
      `https://dune.com/queries/6160942`,
    ],
    protocolIds: ["parent#aerodrome", "3450", "4524"],
    excludeFromAdjustedSupply: ["Gauge Emissions", "Rebase Emissions"],
    incompleteSections: [
      {
        lastRecord: (backfill: boolean) => latest("aerodrome", start, backfill),
        key: "Supply",
        allocation: 2e9,
      },
    ],
  },
  categories: {
    staking: ["Rebase Emissions"],
    farming: ["Gauge Emissions"],
  },
};

export default aerodrome;