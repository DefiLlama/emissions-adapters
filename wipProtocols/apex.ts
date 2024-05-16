import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 0;
const total = 85e7;

const apex: Protocol = {
  "Core Team & Early Investors": manualLinear(
    start + periodToSeconds.years(2),
    start + periodToSeconds.years(4),
    total * 0.23,
  ),

  meta: {
    token: `ethereum:0x52a8845df664d76c69d2eea607cd793565af42b8`,
    sources: [
      "https://www.apex.exchange/blog/detail/apex-token-supply-distribution",
      "https://www.apex.exchange/blog/detail/updates-to-apex-token-unlock-schedule",
    ],
    protocolIds: [""],
  },
  categories: {},
};

export default apex;
