import { balance, latest } from "../adapters/balance";
import { inflation } from "../adapters/ethereum";
import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { GAS_TOKEN } from "../utils/constants";
import { periodToSeconds } from "../utils/time";

const chain = "ethereum";
const start = 1438300800;

const ethereum: Protocol = {
  CrowdSale: manualCliff(start, 6e7),
  "PoW Mining & EIP-1559 Burn": () => inflation(),
  "Early Contributors": manualLinear(
    start,
    start + periodToSeconds.year * 4,
    6e6,
  ),
  "Ethereum Foundation": () =>
    balance(
      ["0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe"],
      GAS_TOKEN,
      "ethereum",
      "ethereum",
      start,
    ),
  meta: {
    token: `${chain}:${GAS_TOKEN}`,
    notes: [
      `Information on the Early Contributor vesting schedule structure could not be found, here we have assumed it as linear.`,
    ],
    sources: [
      "https://ultrasound.money/",
      "https://www.galaxy.com/insights/research/breakdown-of-ethereum-supply-distribution-since-genesis/",
      "https://fastercapital.com/topics/common-token-vesting-strategies-for-airdrop-cryptocurrency.html",
    ],
    protocolIds: ["4488"],
    incompleteSections: [
      {
        key: "Ethereum Foundation",
        allocation: 6e6,
        lastRecord: () => latest("ethereum", start),
      },
      {
        key: "PoW Mining & EIP-1559 Burn",
        allocation: undefined,
        lastRecord: () => latest("ethereum", start),
      },
    ],
  },
  categories: {
    farming: ["PoW Mining & EIP-1559 Burn"],
    insiders: ["Ethereum Foundation"],
    publicSale: ["CrowdSale"],
  },
};
export default ethereum;
