import { getBlock } from "@defillama/sdk/build/computeTVL/blocks";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { unixTimestampNow } from "../utils/time";
import { PromisePool } from "@supercharge/promise-pool";
import { ChainApi } from "@defillama/sdk";
import { queryDune } from "../utils/dune";
import { getLatestTimestamp, incrementalCustomEventToCliffs } from "../utils/eventLogsIncremental";

const start = 1725580800;

const incentivesRewards = async (backfill: boolean = false) => {
  return incrementalCustomEventToCliffs(
    "0x0650CAF159C5A49f711e8169D4336ECB9b950275",
    "ethereum",
    "sky",
    start,
    "event RewardPaid(address indexed user, uint256 reward)",
    "reward",
    18,      
    backfill
  );
};


const sky: Protocol = {
  "Sky Incentives": incentivesRewards,
  meta: {
    sources: [
      "https://etherscan.io/address/0x0650CAF159C5A49f711e8169D4336ECB9b950275#code",
    ],
    incompleteSections: [
      {
        lastRecord: (backfill: boolean) => getLatestTimestamp("sky", start, backfill),
        key: "Daily Rewards",
        allocation: undefined
      }
    ],
    token: "coingecko:sky",
    protocolIds: ["parent#maker"],
    notes: ["This page only tracks the Sky Incentives rewards."],
  },
  categories: {
    farming: ["Sky Incentives"],
  },
};
export default sky;
