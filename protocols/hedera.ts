import { manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const tge = "2019-09-18";
const schedules: { [date: string]: { [section: string]: number } } = {
  "2019-09-31": {
    "Initial Dev Costs / Licensing": 3_510_714,
    "Purchase Agreements": 378_606,
    "Network Governance/Ops": 0,
    "Ecosystem / Open Source Dev": 0,
  },
  "2019-12-31": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 916_050,
    "Network Governance/Ops": 640_865,
    "Ecosystem / Open Source Dev": 8_106,
  },
  "2020-03-31": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 714_393,
    "Network Governance/Ops": 892_140,
    "Ecosystem / Open Source Dev": 10_863,
  },
  "2020-06-30": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 614_545,
    "Network Governance/Ops": 178_332,
    "Ecosystem / Open Source Dev": 22_877,
  },
  "2020-09-31": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 1_292_931,
    "Network Governance/Ops": 272_715,
    "Ecosystem / Open Source Dev": 50_595,
  },
  "2020-12-31": {
    "Initial Dev Costs / Licensing": 293_465,
    "Purchase Agreements": 643_504,
    "Network Governance/Ops": 410_996,
    "Ecosystem / Open Source Dev": 51_950,
  },
  "2021-03-31": {
    "Initial Dev Costs / Licensing": 32_719,
    "Purchase Agreements": 547_496,
    "Network Governance/Ops": 396_121,
    "Ecosystem / Open Source Dev": 37_077,
  },
  "2021-06-30": {
    "Initial Dev Costs / Licensing": 7_395,
    "Purchase Agreements": 519_896,
    "Network Governance/Ops": 515_224,
    "Ecosystem / Open Source Dev": 11_042,
  },
  "2021-09-31": {
    "Initial Dev Costs / Licensing": 9_150,
    "Purchase Agreements": 982_621,
    "Network Governance/Ops": 576_252,
    "Ecosystem / Open Source Dev": 113_280,
  },
  "2021-12-31": {
    "Initial Dev Costs / Licensing": 5_037,
    "Purchase Agreements": 609_837,
    "Network Governance/Ops": 555_716,
    "Ecosystem / Open Source Dev": 2_548_021,
  },
  "2022-03-31": {
    "Initial Dev Costs / Licensing": 4_577,
    "Purchase Agreements": 526_931,
    "Network Governance/Ops": 368_090,
    "Ecosystem / Open Source Dev": 495_917,
  },
  "2022-06-30": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 523_885,
    "Network Governance/Ops": 321_211,
    "Ecosystem / Open Source Dev": 707_310,
  },
  "2022-09-31": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 723_723,
    "Network Governance/Ops": 329_055,
    "Ecosystem / Open Source Dev": 1_915_035,
  },
  "2022-12-31": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 531_441,
    "Network Governance/Ops": 297_432,
    "Ecosystem / Open Source Dev": 18_426,
  },
  "2023-03-31": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 561_178,
    "Network Governance/Ops": 297_432,
    "Ecosystem / Open Source Dev": 4_468_186,
  },
  "2023-06-30": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 531_799,
    "Network Governance/Ops": 392_868,
    "Ecosystem / Open Source Dev": 799_962,
  },
  "2023-09-31": {
    "Initial Dev Costs / Licensing": 10_723,
    "Purchase Agreements": 424_981,
    "Network Governance/Ops": 392_868,
    "Ecosystem / Open Source Dev": 449_019,
  },
  "2023-12-31": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 50_588,
    "Network Governance/Ops": 392_868,
    "Ecosystem / Open Source Dev": 33_731,
  },
  "2024-03-31": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 37_969,
    "Network Governance/Ops": 392_868,
    "Ecosystem / Open Source Dev": 15_588,
  },
  "2024-06-30": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 28_132,
    "Network Governance/Ops": 392_868,
    "Ecosystem / Open Source Dev": 1_996_090,
  },
  "2024-09-31": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 67_513,
    "Network Governance/Ops": 100_079,
    "Ecosystem / Open Source Dev": 1_697_796,
  },
  "2024-12-31": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 33_760,
    "Network Governance/Ops": 100_079,
    "Ecosystem / Open Source Dev": 404_273,
  },
  "2025-03-31": {
    "Initial Dev Costs / Licensing": 0,
    "Purchase Agreements": 110_825,
    "Network Governance/Ops": 142_098,
    "Ecosystem / Open Source Dev": 3_630_435,
  },
};

const hedera: Protocol = {
  meta: {
    notes: [`67,018,958 HBAR (0.13%) have yet to be allocated`],
    token: "coingecko:hedera-hashgraph",
    sources: ["https://hedera.com/treasury-management-report"],
    protocolIds: ["5861"],
  },
  categories: {
    noncirculating: ["Network Governance/Ops"],
    farming: ["Ecosystem / Open Source Dev"],
    privateSale: ["Purchase Agreements"],
    insiders: ["Initial Dev Costs / Licensing"],
  },
};

Object.keys(schedules).map((end: string, i: number) => {
  const start: string = i == 0 ? tge : Object.keys(schedules)[i - 1];
  Object.keys(schedules[end]).map((section: string) => {
    if (!(section in hedera)) hedera[section] = [];
    hedera[section].push(
      manualLinear(start, end, schedules[end][section] * 1000),
    );
  });
});

export default hedera;
