import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryDuneSQLCached } from "../utils/dune";
import { periodToSeconds } from "../utils/time";

const start = 1701907200;
const total = 1e9;
const jitoDAOAllocation = "Community Growth"

const jitoDAO = async (): Promise<CliffAdapterResult[]> => {
  return await queryDuneSQLCached(`
    SELECT
        to_unixtime(t.block_time) AS date,
        t.amount_display AS amount
    FROM tokens_solana.transfers t
    WHERE t.token_mint_address = 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL'
    AND t.from_owner IN (
        '8sjM83a4u2M8YZYshLGKzYxh1VHFfbgtaytwaoEg4bUJ',
        '6gPfHGqtcxWZxFnJiNc9CqhuQY38K52bt2U7KZhMBMKs',
        'EgRs45RzTSESWY6TqjUzwL94fMNkCy9A7Jrbz3LfUxV9',
        '5wQULuzRkYe4KAttSD1L1fuxavjepcMn1PycNMmPchna',
        '7muKsqJwrWczBKE5ZNvApvdsku6ZVjaWT6w5ZbzbxrfY'
    )
    AND t.to_owner NOT IN (
        '8sjM83a4u2M8YZYshLGKzYxh1VHFfbgtaytwaoEg4bUJ',
        '6gPfHGqtcxWZxFnJiNc9CqhuQY38K52bt2U7KZhMBMKs',
        'EgRs45RzTSESWY6TqjUzwL94fMNkCy9A7Jrbz3LfUxV9',
        '5wQULuzRkYe4KAttSD1L1fuxavjepcMn1PycNMmPchna',
        '7muKsqJwrWczBKE5ZNvApvdsku6ZVjaWT6w5ZbzbxrfY'
    )
    AND t.block_time >= START
    ORDER BY date
`, 1698364800, {protocolSlug: "jito", allocation: jitoDAOAllocation})
}

const jito: Protocol = {
  Investors: [
    manualCliff(start + periodToSeconds.year, (total * 0.162) / 3),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(2),
      (total * 0.162 * 2) / 3,
    ),
  ],
  "Core Contributors": [
    manualCliff(start + periodToSeconds.year, (total * 0.245) / 3),
    manualLinear(
      start + periodToSeconds.year,
      start + periodToSeconds.years(2),
      (total * 0.245 * 2) / 3,
    ),
  ],
  "Ecosystem Development": manualLinear(
    start,
    start + periodToSeconds.years(6),
    total * 0.25,
  ),
  Airdrop: [
    manualCliff(start, total * 0.09),
    manualLinear(start, start + periodToSeconds.year, total * 0.01),
  ],
  [jitoDAOAllocation]: jitoDAO,
  meta: {
    token: `coingecko:jito-governance-token`,
    sources: [
      "https://www.jito.network/blog/announcing-jto-the-jito-governance-token/",
    ],
    notes: [
      `From the chart given in the source material, Jito estimate ~6 year linear vesting schedule for Community Growth and Ecosystem Development sections. Therefore we have used the same in this analysis, For the Community Growth section, we have used the Jito DAO token outflow data to estimate the vesting schedule.`,
    ],
    protocolIds: ["parent#jito"],
  },
  categories: {
    noncirculating: ["Ecosystem Development"],
    airdrop: ["Airdrop"],
    farming: ["Community Growth"],
    privateSale: ["Investors"],
    insiders: ["Core Contributors"],
  },
};

export default jito;