import adapter from "../adapters/aave/aave";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const lendDevQty = 3000000;
const lendSaleQty = 10000000;
const lendSale = 1512777600;

const devSchedule = (portion: number) => [
  manualCliff(lendSale, lendDevQty * portion / 5),
  manualStep(lendSale, periodToSeconds.year / 2, 4, lendDevQty * portion / 5),
];

const aave: Protocol = {
  "LEND core development": devSchedule(0.3),
  "LEND user experience development": devSchedule(0.2),
  "LEND management and legal": devSchedule(0.2),
  "LEND promotions and marketing": devSchedule(0.2),
  "LEND unexpected costs": devSchedule(0.1),
  "LEND public sale": manualCliff(lendSale, lendSaleQty),
  "Ecosysten reserve": async () =>
    adapter(
      "0x25F2226B597E8F9514B3F68F00f494cF4f286491",
      "ethereum",
      //3_000_000,
    ), // needs to end on a dashed line
  meta: {
    sources: [
      "https://docs.aave.com/aavenomics/incentives-policy-and-aave-reserve",
      "https://etherscan.io/tx/0x751c299f081d1a763cb6eff46616574a822b7d3376168e406e25ba03293e17b2",
      "https://github.com/ETHLend/Documentation/blob/master/ETHLendWhitePaper.md#token-distribution",
    ],
    notes: [
      "not all ecosystem reserve funds have been given an emission schedule. Any undefined ecosystem reserve emissions have been excluded from this analysis.",
    ],
    token: "ethereum:0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    protocolIds: ["111", "1599", "1838", "1839"],
  },
  sections: {
    noncirculating: ["Ecosysten reserve"],
    publicSale: ["LEND to AAVE migrator"],
  },
};
export default aave;
