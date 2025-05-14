import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const start = 1659657600;
const totalSupply = 120_000_000;

const rewardsFarming = totalSupply * 0.3875;
const privateSale = totalSupply * 0.2125;
const publicSale = totalSupply * 0.05;
const teamAdvisor = totalSupply * 0.2125;
const ecosystemDAO = totalSupply * 0.1375;

const stader: Protocol = {
   "Rewards & Farming": manualCliff(
    start,
    rewardsFarming,
   ),

   "Private Sale": [
    manualCliff(
      start,
      privateSale * 0.05,
    ),
    manualStep(
      start,
      periodToSeconds.month,
      36,
      privateSale * 0.95 / 36,
    )
   ],
    "Public Sale": manualCliff(
      start,
      publicSale,
    ),
    "Team & Advisors": manualStep
      (
        start + periodToSeconds.months(6),
        periodToSeconds.month,
        36,
        teamAdvisor / 36,
      ),
    "Ecosystem & DAO": manualCliff(
      start,
      ecosystemDAO,
    ),

  meta: {
    token: "coingecko:stader",
    sources: ["https://www.staderlabs.com/blogs/diving-deeper-into-sd-tokenomics/", "https://www.staderlabs.com/blog/stader-tge-date-announcement/"],
    protocolIds: ["1044"],
    notes: ["SD Tokenomics changed in June 2024, where it reduced the total supply to 120M by doing 30M burn.", "Private Sale unlocks between 0-5% at TGE, we assume it unlocks 5% at TGE and linearly vests 36 months post TGE", "Rewards & Farming is determined via governance proposals, for simplicity we assume 100% of the rewards are unlocked.", "Ecosystem & DAO is assumed to be unlocked at TGE."],
  },

  categories: {
    privateSale: ["Private Sale"],
    publicSale: ["Public Sale"],
    insiders: ["Team & Advisors"],
    farming: ["Rewards & Farming"],
    noncirculating: ["DAO & Ecosystem"],
  }
};

export default stader;
