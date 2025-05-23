import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import { getEmissionsV1, getEmissionsV2 } from "../adapters/velodrome";

const qty = 400000000;
const start = 1654066800;

function velodrome(): Protocol {
  return {
    "Community": manualCliff(start, qty * 0.6),
    "Partner Protocols": manualCliff(start, qty * 0.18),
    "Grants": manualCliff(start, qty * 0.06),
    "Team": [
      manualCliff(start, qty * 0.025),
      manualLinear(
        start + 0.5 * periodToSeconds.year,
        start + periodToSeconds.year,
        15520816,
      ),
      manualLinear(
        start + periodToSeconds.year,
        start + 2 * periodToSeconds.year,
        7200000,
      ),
      () => getEmissionsV1("team")
    ],
    "Optimism Team": manualCliff(start, qty * 0.05),
    "Genesis Liquidity Pools": manualCliff(start, qty * 0.01),
    "Rebase Emissions v1": () => getEmissionsV1("rebase"),
    "Rebase Emissions v2": () => getEmissionsV2("rebase"),
    "Gauge Emissions v1": () => getEmissionsV1("gauge"),
    "Gauge Emissions v2": () => getEmissionsV2("gauge"),
    meta: {
      sources: ["https://docs.velodrome.finance/tokenomics"],
      notes: [
        "Ongoing emissions are tracked directly from onchain data.",
        "V1 and V2 emissions operate in parallel.",
        "V1 token are convertible to V2 at a 1:1 ratio.",
        "The allocation for Partner Protocols between table and text is different, we used the text value.",
      ],
      token: "optimism:0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db",
      protocolIds: ["parent#velodrome"],
    },
    categories: {
      farming: ["Community", "Genesis Liquidity Pools", "Rebase Emissions v2", "Gauge Emissions v2"],
      airdrop: ["Partner Protocols"],
      noncirculating: ["Grants"],
      insiders: ["Team", "Optimism Team"],
    },
  };
}

export default velodrome();
