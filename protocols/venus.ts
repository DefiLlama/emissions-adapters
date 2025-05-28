import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryDune } from "../utils/dune";
import { periodToSeconds } from "../utils/time";

const start: number = 1601161200;
const qty: number = 30000000;

const xvsRewards = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const issuanceData = await queryDune("5199229", true)

  for (let i = 0; i < issuanceData.length; i++) {
    result.push({
      type: "cliff",
      start: issuanceData[i].timestamp,
      amount: issuanceData[i].amount
    });
  }
  return result;
}


const quickswap: Protocol = {
  "Binance LaunchPool": manualCliff(start, qty * 0.2),
  "Ecosystem grants": manualCliff(start, qty * 0.01),
  Incentives: xvsRewards,
  meta: {
    notes: [
      `XVS incentives is calculated based on total claimed daily`,
    ],
    sources: ["https://venus.io/Whitepaper.pdf"],
    token: "bsc:0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63",
    protocolIds: ["212"],
  },
  categories: {
    farming: ["Binance LaunchPool", "Incentives"],
    noncirculating: ["Ecosystem grants"],
  },
};
export default quickswap;
