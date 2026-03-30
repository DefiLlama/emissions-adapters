import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, ProtocolV2, SectionV2 } from "../types/adapters";
import { queryCustom } from "../utils/queries";
import { readableToSeconds, periodToSeconds } from "../utils/time";

const start = 1693267200;
const total = 5e8;
const chain = "base";
const token = "0x940181a94a35a4569e4529a3cdfb74e38fd98631";
const minter = "0xeb018363f0a9af8f91f06fee6613a751b2a33fe5";
const voter = "0x16613524e02ad97edfef371bc883f2f5d6c480a5";
const rewardsDistributor = "0x227f65131a261548b057215bb1d5ab2997964c7d";
const teamAddress = "0xbde0c70bdc242577c52dfad53389f82fd149ea5a";

const TRANSFER_TOPIC0 = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const padded = (addr: string) => "0x000000000000000000000000" + addr.slice(2);

const queryMinterTransfers = async (recipient: string): Promise<CliffAdapterResult[]> => {
  const data = await queryCustom(`
    SELECT
      toStartOfDay(timestamp) AS date,
      SUM(reinterpretAsUInt256(reverse(unhex(substring(data, 3))))) / 1e18 AS amount
    FROM evm_indexer.logs
    PREWHERE chain = '8453' AND short_address = '0x940181a9' AND short_topic0 = '0xddf252ad'
    WHERE topic0 = '${TRANSFER_TOPIC0}'
      AND address = '${token}'
      AND topic1 = '${padded(minter)}'
      AND topic2 = '${padded(recipient)}'
    GROUP BY date
    ORDER BY date DESC
  `, {});

  return data.map((d: any) => ({
    type: "cliff" as const,
    start: readableToSeconds(d.date),
    amount: Number(d.amount),
    isUnlock: false,
  }));
};

const gaugeSection: SectionV2 = {
  displayName: "Gauge Emissions",
  methodology:
    "Tracks AERO distributed from the Minter to the Voter contract each epoch for LP gauge rewards.",
  isIncentive: true,
  components: [
    {
      id: "gauge-rewards",
      name: "LP Gauge Rewards",
      methodology:
        "AERO transferred from Minter to Voter contract, tracked via Transfer events on Base.",
      isIncentive: true,
      fetch: () => queryMinterTransfers(voter),
      metadata: {
        contract: token,
        chain: "base",
        eventSignature: TRANSFER_TOPIC0,
      },
    },
  ],
};

const rebaseSection: SectionV2 = {
  displayName: "Rebase Emissions",
  methodology:
    "Tracks AERO distributed from the Minter to the RewardsDistributor for veAERO rebase, reducing vote power dilution for lockers.",
  isIncentive: false,
  components: [
    {
      id: "veaero-rebase",
      name: "veAERO Rebase",
      isIncentive: false,
      methodology:
        "AERO transferred from Minter to RewardsDistributor, tracked via Transfer events on Base.",
      fetch: () => queryMinterTransfers(rewardsDistributor),
      metadata: {
        contract: token,
        chain: "base",

        eventSignature: TRANSFER_TOPIC0,
      },
    },
  ],
};

const teamEmissionsSection: SectionV2 = {
  displayName: "Team Emissions",
  methodology:
    "5% of weekly emissions minted to the team address from the Minter contract.",
  isIncentive: false,
  components: [
    {
      id: "team-emissions",
      name: "Team 5% Cut",
      isIncentive: false,
      methodology:
        "AERO transferred from Minter to team address, tracked via Transfer events on Base.",
      fetch: () => queryMinterTransfers(teamAddress),
      metadata: {
        contract: token,
        chain: "base",
        eventSignature: TRANSFER_TOPIC0,
      },
    },
  ],
};

const aerodrome: ProtocolV2 = {
  "Voter Incentives": manualCliff(start, total * 0.08),
  "Genesis Liquidity Pool": manualCliff(start, total * 0.02),
  "Airdrop for veVELO Lockers": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.4,
  ),
  "Public Goods Fund": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.21,
  ),
  "Team Funding": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.19,
  ),
  "Flight School": manualLinear(
    start,
    start + periodToSeconds.years(4),
    total * 0.1,
  ),
  "Gauge Emissions": gaugeSection,
  "Rebase Emissions": rebaseSection,
  "Team Emissions": teamEmissionsSection,
  meta: {
    version: 2,
    notes: [
      `After Epoch 67, emissions are controlled by the Aero Fed where veAERO voters decide to increase, decrease, or maintain emission rates.`,
      `Sections Airdrop for veVELO Lockers, Public Goods Fund, Team Funding, and Flight School are distributed as veAERO (vote-locked). Auto Max-Locked portions (Public Goods, Team, Flight School) remain locked for 4 years unless auto-max-lock is disabled.`,
      `Team receives 5% of weekly emissions, tracked separately as Team Emissions.`,
    ],
    token: `${chain}:${token}`,
    sources: [
      `https://aerodrome.finance/docs#tokenomics`,
      `https://github.com/aerodrome-finance/contracts/blob/main/contracts/Minter.sol#L170-L198`,
    ],
    protocolIds: ["parent#aerodrome"],
  },
  categories: {
    insiders: ["Team Funding", "Team Emissions"],
    airdrop: ["Airdrop for veVELO Lockers"],
    noncirculating: ["Public Goods Fund", "Flight School"],
    farming: ["Gauge Emissions", "Voter Incentives", "Genesis Liquidity Pool"],
    staking: ["Rebase Emissions"],
  },
};

export default aerodrome;
