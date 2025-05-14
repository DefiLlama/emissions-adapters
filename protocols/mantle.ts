import { Protocol } from "../types/adapters";
import { manualCliff } from "../adapters/manual";
import { balance, latest } from "../adapters/balance";

const start = 1688317200;
const deployed = 1696636800;
const chain = "mantle";
const token = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000";

const mantle: Protocol = {
  Circulating: manualCliff(start, 3172988154),
  Treasury: [
    (backfill: boolean) =>
      balance(
        [
          "0x78605Df79524164911C144801f41e9811B7DB73D",
          "0xCa264A4Adf80d3c390233de135468A914f99B6a5",
          "0x34cAfA03D9750124102059eE35619A9C5D5aF7df",
          "0x164Cf077D3004bC1f26E7A46Ad8fA54df4449E3F",
          "0xA5b79541548ef2D48921F63ca72e4954e50a4a74",
          "0xf0e91a74cb053d79b39837E1cfba947D0c98dd93",
          "0x1a743BD810dde05fa897Ec41FE4D42068F7fD6b2",
        ],
        "0x3c3a81e81dc49A522A592e7622A7E711c06bf354",
        "ethereum",
        chain,
        deployed,
        backfill,
      ),
    (backfill: boolean) =>
      balance(
        [
          "0x94FEC56BBEcEaCC71c9e61623ACE9F8e1B1cf473",
          "0xcD9Dab9Fa5B55EE4569EdC402d3206123B1285F4",
          "0x87C62C3F9BDFc09200bCF1cbb36F233A65CeF3e6",
          "0x992b65556d330219e7e75C43273535847fEee262",
        ],
        token,
        chain,
        chain,
        start,
        backfill,
      ),
  ],
  meta: {
    sources: ["https://docs.mantle.xyz/governance/parameters/tokenomics"],
    token: `${chain}:${token}`,
    protocolIds: ["3782"],
    incompleteSections: [
      {
        lastRecord: (backfill: boolean) => latest(chain, deployed, backfill),
        key: "Treasury",
        allocation: 3046328614,
      },
    ],
  },
  categories: {
    noncirculating: ["Treasury"],
    publicSale: ["Circulating"],
  },
};

export default mantle;
