import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";
import incentives from "../adapters/curve/community";

const qty = 400_000_000;
const start = 1654066800;
const velodrome: Protocol = async () => {
  const velodromeCommunity = incentives(
    "0x3c8B650257cFb5f272f799F5e2b4e65093a11a05",
    1654066800,
    15_000_000 * 0.97,
    1.0101010101,
    periodToSeconds.week,
  );
  const velodromeTeam = incentives(
    "0x3c8B650257cFb5f272f799F5e2b4e65093a11a05",
    1654066800 + periodToSeconds.month * 3,
    15_000_000 * 0.03,
    1.0101010101,
    periodToSeconds.week,
  );
  return {
    community: manualCliff(start, qty * 0.6),
    protocols: manualCliff(start, qty * 0.18),
    grants: manualCliff(start, qty * 0.06),
    team: [
      manualCliff(start, qty * 0.025),
      manualLinear(
        start + 0.5 * periodToSeconds.year,
        start + periodToSeconds.year,
        15_520_816,
      ),
      manualLinear(
        start + periodToSeconds.year,
        start + 2 * periodToSeconds.year,
        7_200_000,
      ),
      velodromeTeam,
    ],
    "Optimism team": manualCliff(start, qty * 0.05),
    "Genesis liquidity pools": manualCliff(start, qty * 0.01),
    "continuing emissions": velodromeCommunity,
    sources: ["https://docs.velodrome.finance/tokenomics"],
    notes: [
      "Velodrome team's 3% rake of emissions is locked for 3 months, then linearly vested for 3. Here we have indicated just the 3 month cliff.",
      "1/6 of this rake (0.5%) goes to the team as 6-month locked veVELO and then is linearly unlocked for 6 months. This hasnt been accounted for.",
    ],
    token: "optimism:0x3c8b650257cfb5f272f799f5e2b4e65093a11a05",
    protocolIds: ["1799"],
  };
}

export default velodrome;
