import { manualCliff, manualLinear } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const prime: Protocol = {
  "Gameplay Pool": manualLinear("2023-03-01", "2028-03-01", 365 * 5 + 1),
  "Parallel Studios Reserve": manualLinear(
    "2025-06-01",
    "2027-12-01",
    21848888,
  ),
  "Parallel Studios Investors": manualLinear(
    "2023-07-31",
    "2025-07-31",
    18044478,
  ),
  Caching: manualLinear("2022-07-18", "2023-07-17", 15666667),
  "Echelon Foundation Reserve": manualLinear(
    "2023-03-01",
    "2027-03-01",
    12428333,
  ),
  "Prime Events": [
    manualCliff("2022-02-13", 3333333),
    manualCliff("2022-05-12", 1666667),
    manualCliff("2022-08-10", 1666667),
    manualCliff("2022-10-19", 1666667),
    manualCliff("2023-02-03", 1666667),
  ],
  meta: {
    notes: [
      `No unlock schedule is described for the Echelon Foundation Reserve (11.2%). Here we have assumed a 4 year linear unlock.`,
      `Gameplay Pool unlocks are not detailed in the source material. Here we have used the max of 6 PRIME per day`,
      `In the source material no schedule is given for the Caching section, here we have assumed a linear unlock.`,
    ],
    token: "coingecko:echelon-prime",
    sources: [
      `https://docs.echelon.io/echelon-prime-foundation/7.0-initial-token-distribution/7.3-unlocks`,
    ],
    protocolIds: ["4925"],
    total: 111111111,
  },
  categories: {
    noncirculating: ["Echelon Foundation Reserve"],
  },
};

export default prime;
