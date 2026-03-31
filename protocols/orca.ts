import { Protocol, SectionV2 } from "../types/adapters";
import { queryDuneSQLCached } from "../utils/dune";

const start = 1628553600; // August 10, 2021

const aquafarmQuery = queryDuneSQLCached(`
  SELECT to_unixtime(ic.block_date) as date, SUM(amount_display) as amount
  FROM solana.instruction_calls ic
  LEFT JOIN tokens_solana.transfers t
    ON ic.tx_id = t.tx_id
    AND t.token_mint_address = 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE'
    AND t.block_time >= START
  WHERE executing_account = '82yxjeMsvaURa4MbZZ7WZZHfobirZYkH1zF8fmeGtyaQ'
    AND ic.block_time >= START
    AND bytearray_starts_with(ic.data, 0x04)
  GROUP BY ic.block_date
  ORDER BY ic.block_date ASC
`, start, { protocolSlug: 'orca', allocation: 'Aquafarms Incentives'})

const whirlPoolsQuery = queryDuneSQLCached(`
  SELECT to_unixtime(ic.block_date) AS date, SUM(t.amount_display) AS amount 
  FROM solana.instruction_calls ic
  LEFT JOIN tokens_solana.transfers t 
    ON ic.tx_id = t.tx_id
    AND t.block_time >= START
    AND t.token_mint_address = 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE'
    AND t.from_token_account = CASE
      WHEN bytearray_starts_with(ic.data, 0x4605845756ebb12200)
        THEN ic.account_arguments[6]   -- v1: 6th account
      WHEN bytearray_starts_with(ic.data, 0xb16b25b4a01331d10000)
        THEN ic.account_arguments[7]   -- v2: 7th account
      END
  WHERE ic.executing_account = 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'
    AND (
        bytearray_starts_with(ic.data, 0x4605845756ebb12200)
        OR bytearray_starts_with(ic.data, 0xb16b25b4a01331d10000)
    )
    AND ic.block_time >= START
  GROUP BY ic.block_date
  ORDER BY ic.block_date ASC
`, start, { protocolSlug: 'orca', allocation: 'Whirlpools Incentives'})

const aquafarmSection: SectionV2 = {
  displayName: "Aquafarms Incentives",
  methodology:
    "ORCA Tokens emitted to aquafarms",
  isIncentive: true,
  components: [
    {
      id: "aquafarm-incentives",
      name: "Aquafarms Incentives",
      methodology:
        "Tracks Harvest instruction calls on the Aquafarms program, filtering for ORCA claims",
      isIncentive: true,
      fetch: async () => aquafarmQuery,
    },
  ],
};

const whirlpoolSection: SectionV2 = {
  displayName: "Whirlpools Incentives",
  methodology:
    "ORCA Tokens emitted to whirlpools",
  isIncentive: true,
  components: [
    {
      id: "whirlpools-incentives",
      name: "Whirlpools Incentives",
      methodology:
        "Tracks collectRewards and collectRewardsV2 instruction calls on the Whirlpools program, filtering for ORCA claims",
      isIncentive: true,
      fetch: async () => whirlPoolsQuery,
    },
  ],
};

const orca: Protocol = {
  "Aquafarms Incentives": aquafarmSection,
  "Whirlpools Incentives": whirlpoolSection,
  meta: {
    version: 2,
    token: "solana:orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    sources: [
      "https://solscan.io/account/whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
      "https://solscan.io/account/82yxjeMsvaURa4MbZZ7WZZHfobirZYkH1zF8fmeGtyaQ",
    ],
    protocolIds: ["parent#orca"],
    notes: [
      "Only Aquafarm and Whirlpool incentives are tracked"
    ],
    incentivesOnly: true
  },
  
  categories: {
    farming: ["Aquafarms Incentives", "Whirlpools Incentives"]
  },
};

export default orca;