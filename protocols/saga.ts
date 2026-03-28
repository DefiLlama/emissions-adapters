import { manualCliff, manualLinear } from "../adapters/manual";
import { ProtocolV2, SectionV2 } from "../types/adapters";
import { years } from "../utils/time";

const start = 1712620800;
const total = 1e9;

const ecosystemSection: SectionV2 = {
  displayName: "Ecosystem & Development",
  isTBD: true,
  components: [
    {
      id: "ecosystem-development",
      name: "Ecosystem & Development",
      isTBD: true,
      fetch: async () => [manualCliff(start, total * 0.3)],
    },
  ],
};

const foundationSection: SectionV2 = {
  displayName: "Foundation & Reserve",
  isTBD: true,
  components: [
    {
      id: "foundation-reserve",
      name: "Foundation & Reserve",
      isTBD: true,
      fetch: async () => [manualCliff(start, total * 0.1)],
    },
  ],
};

const futureAirdropsSection: SectionV2 = {
  displayName: "Future Airdrops",
  isTBD: true,
  components: [
    {
      id: "airdrops-phases-2-6",
      name: "Airdrops Phases 2 to 6",
      isTBD: true,
      fetch: async () => [manualCliff(start, total * 0.04)],
    },
    {
      id: "airdrops-post-phase-6",
      name: "Airdrops Post Phase 6",
      isTBD: true,
      fetch: async () => [manualCliff(start, total * 0.1)],
    },
  ],
};

const saga: ProtocolV2 = {
  "Core Contributors": [
    manualCliff(years(start, 1), (total * 0.2) / 3),
    manualLinear(
      years(start, 1),
      years(start, 3),
      (total * 0.2 * 2) / 3,
    ),
  ],
  Fundraising: [
    manualCliff(years(start, 1), (total * 0.2) / 3),
    manualLinear(
      years(start, 1),
      years(start, 3),
      (total * 0.2 * 2) / 3,
    ),
  ],
  "Ecosystem & Development": ecosystemSection,
  "Foundation & Reserve": foundationSection,
  Airdrops: [manualCliff(start, total * 0.06)],
  "Future Airdrops": futureAirdropsSection,
  meta: {
    version: 2,
    token: `coingecko:saga-2`,
    sources: [
      "https://medium.com/sagaxyz/saga-mainnet-technical-launch-plan-c084b1426acc",
    ],
    notes: [
      "This does not include staking rewards",
    ],
    protocolIds: ["4639"],
    total,
  },
  categories: {
    airdrop: ["Airdrops"],
    noncirculating: [
      "Foundation & Reserve",
      "Ecosystem & Development",
      "Future Airdrops",
    ],
    privateSale: ["Fundraising"],
    insiders: ["Core Contributors"],
  },
};

export default saga;
