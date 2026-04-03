import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { months, years } from "../utils/time";

const start = 1728518400; // 2024-10-10
const total = 1e9;

const carv: Protocol = {
  Liquidity: manualCliff(start, total * 0.04),
  "Ecosystem & Treasury": manualCliff(start, total * 0.09),
  "Early Investors": manualLinear(
    months(start, 6),
    months(start, 42),
    total * 0.09246,
  ),
  "Private Fundraising": manualLinear(
    months(start, 6),
    months(start, 42),
    total * 0.08295,
  ),
  "Founding Team & Advisors": manualLinear(
    months(start, 9),
    months(start, 45),
    total * 0.19459,
  ),
  "Nodes & Community": manualLinear(
    start,
    years(start, 4),
    total * 0.5,
  ),
  meta: {
    token: "ethereum:0xc08cd26474722ce93f4d0c34d16201461c10aa8c",
    sources: ["https://docs.carv.io/carv-token/distribution-and-vesting"],
    protocolIds: ["7628"],
    total,
    notes: [
      "Nodes & Community vesting follows a rewards schedule over 4 years, modeled as linear",
      "Ecosystem & Treasury shown as 100% at TGE per available data",
    ],
  },
  categories: {
    insiders: ["Founding Team & Advisors"],
    privateSale: ["Early Investors", "Private Fundraising"],
    noncirculating: ["Ecosystem & Treasury"],
    farming: ["Nodes & Community"],
    liquidity: ["Liquidity"],
  },
};

export default carv;
