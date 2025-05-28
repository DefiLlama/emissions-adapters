import { manualCliff, manualLinear } from "../adapters/manual";
import { CliffAdapterResult, Protocol } from "../types/adapters";
import { queryDune } from "../utils/dune";
import { periodToSeconds } from "../utils/time";

const start = 1670889600;
const totalSupply = 50_000_000;

// Allocation amounts
const airdropProtocol = totalSupply * 0.19;
const lp = totalSupply * 0.04;
const airdropUsers = totalSupply * 0.25;
const team = totalSupply * 0.18;
const airdropNFT = totalSupply * 0.09;
const ecosystem = totalSupply * 0.25;

const emissions = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  const issuanceData = await queryDune("5199249", true)

  for (let i = 0; i < issuanceData.length; i++) {
    result.push({
      type: "cliff",
      start: issuanceData[i].timestamp,
      amount: issuanceData[i].amount,
      isUnlock: false,
    });
  }
  return result;
}


const thena: Protocol = {
  "Initial Liquidity": manualCliff(start, lp),
  "veTHE Airdrop to Protocol": manualCliff(start, airdropProtocol),
  "veTHE Airdrop to Users": manualCliff(start, airdropUsers),
  "veTHE Airdrop to NFT Holders": [
    manualCliff(start, airdropNFT * 0.6),
    manualCliff(start + periodToSeconds.years(2), airdropNFT * 0.4),
  ],
  "Ecosystem Grants": manualCliff(start, ecosystem),
  "Team": [
    manualCliff(start + periodToSeconds.years(2), team * 0.6),
    manualLinear(start + periodToSeconds.years(1), start + periodToSeconds.years(3), team * 0.4),
  ],
  Emissions: emissions,
  meta: {
    notes: [
      `Emissions data is sourced from Mint events`,
      `Airdrop and Team is splitted between veTHE and THE for simplicity we assume all of it are THE`,
      `Airdrop and Ecosystem Grants are assumed to be unlocked at start`,
    ],
    sources: ["https://bscscan.com/address/0x86069feb223ee303085a1a505892c9d4bdbee996", "https://docs.thena.fi/thena/the-tokenomics/initial-supply-and-emissions-schedule"],
    token: "coingecko:thena",
    protocolIds: ["parent#thena"],
  },
  categories: {
    farming: ["Emissions"],
    airdrop: [
      "veTHE Airdrop to Protocol",
      "veTHE Airdrop to Users",
      "veTHE Airdrop to NFT Holders",
    ],
    insiders: ["Team"],
    liquidity: ["Initial Liquidity"],
    noncirculating: [
      "Ecosystem Grants",
    ]
  },
};
export default thena;
