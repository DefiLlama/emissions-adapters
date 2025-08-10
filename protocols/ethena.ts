import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1709679600;
const token = "0x57e114b691db790c35207b2e685d4a43181e6061";
const chain = "ethereum";

const data: { [section: string]: any }[] = [
  {
    Investors: "0",
    Team: "0",
    "Ecosystem Development": "1125000000",
    Foundation: "300000000",
  },
  {
    Investors: "0",
    Team: "0",
    "Ecosystem Development": "1179687500",
    Foundation: "340625000",
  },
  {
    Investors: "0",
    Team: "0",
    "Ecosystem Development": "1234375000",
    Foundation: "381250000",
  },
  {
    Investors: "0",
    Team: "0",
    "Ecosystem Development": "1289062500",
    Foundation: "421875000",
  },
  {
    Investors: "0",
    Team: "0",
    "Ecosystem Development": "1343750000",
    Foundation: "462500000",
  },
  {
    Investors: "0",
    Team: "0",
    "Ecosystem Development": "1398437500",
    Foundation: "503125000",
  },
  {
    Investors: "0",
    Team: "0",
    "Ecosystem Development": "1903125000",
    Foundation: "543750000",
  },
  {
    Investors: "0",
    Team: "0",
    "Ecosystem Development": "1957812500",
    Foundation: "584375000",
  },
  {
    Investors: "0",
    Team: "0",
    "Ecosystem Development": "2012500000",
    Foundation: "625000000",
  },
  {
    Investors: "0",
    Team: "0",
    "Ecosystem Development": "2067187500",
    Foundation: "665625000",
  },
  {
    Investors: "0",
    Team: "0",
    "Ecosystem Development": "2121875000",
    Foundation: "706250000",
  },
  {
    Investors: "0",
    Team: "0",
    "Ecosystem Development": "2176562500",
    Foundation: "746875000",
  },
  {
    Investors: "937500000",
    Team: "1125000000",
    "Ecosystem Development": "2231250000",
    Foundation: "787500000",
  },
  {
    Investors: "1015625000",
    Team: "1218750000",
    "Ecosystem Development": "2585937500",
    Foundation: "828125000",
  },
  {
    Investors: "1093750000",
    Team: "1312500000",
    "Ecosystem Development": "2640625000",
    Foundation: "868750000",
  },
  {
    Investors: "1171875000",
    Team: "1406250000",
    "Ecosystem Development": "2695312500",
    Foundation: "909375000",
  },
  {
    Investors: "1250000000",
    Team: "1500000000",
    "Ecosystem Development": "2750000000",
    Foundation: "950000000",
  },
  {
    Investors: "1328125000",
    Team: "1593750000",
    "Ecosystem Development": "2804687500",
    Foundation: "990625000",
  },
  {
    Investors: "1406250000",
    Team: "1687500000",
    "Ecosystem Development": "2859375000",
    Foundation: "1031250000",
  },
  {
    Investors: "1484375000",
    Team: "1781250000",
    "Ecosystem Development": "2914062500",
    Foundation: "1071875000",
  },
  {
    Investors: "1562500000",
    Team: "1875000000",
    "Ecosystem Development": "2968750000",
    Foundation: "1112500000",
  },
  {
    Investors: "1640625000",
    Team: "1968750000",
    "Ecosystem Development": "3023437500",
    Foundation: "1153125000",
  },
  {
    Investors: "1718750000",
    Team: "2062500000",
    "Ecosystem Development": "3078125000",
    Foundation: "1193750000",
  },
  {
    Investors: "1796875000",
    Team: "2156250000",
    "Ecosystem Development": "3132812500",
    Foundation: "1234375000",
  },
  {
    Investors: "1875000000",
    Team: "2250000000",
    "Ecosystem Development": "3187500000",
    Foundation: "1275000000",
  },
  {
    Investors: "1953125000",
    Team: "2343750000",
    "Ecosystem Development": "3242187500",
    Foundation: "1315625000",
  },
  {
    Investors: "2031250000",
    Team: "2437500000",
    "Ecosystem Development": "3296875000",
    Foundation: "1356250000",
  },
  {
    Investors: "2109375000",
    Team: "2531250000",
    "Ecosystem Development": "3351562500",
    Foundation: "1396875000",
  },
  {
    Investors: "2187500000",
    Team: "2625000000",
    "Ecosystem Development": "3406250000",
    Foundation: "1437500000",
  },
  {
    Investors: "2265625000",
    Team: "2718750000",
    "Ecosystem Development": "3460937500",
    Foundation: "1478125000",
  },
  {
    Investors: "2343750000",
    Team: "2812500000",
    "Ecosystem Development": "3515625000",
    Foundation: "1518750000",
  },
  {
    Investors: "2421875000",
    Team: "2906250000",
    "Ecosystem Development": "3570312500",
    Foundation: "1559375000",
  },
  {
    Investors: "2500000000",
    Team: "3000000000",
    "Ecosystem Development": "3625000000",
    Foundation: "1600000000",
  },
  {
    Investors: "2578125000",
    Team: "3093750000",
    "Ecosystem Development": "3679687500",
    Foundation: "1640625000",
  },
  {
    Investors: "2656250000",
    Team: "3187500000",
    "Ecosystem Development": "3734375000",
    Foundation: "1681250000",
  },
  {
    Investors: "2734375000",
    Team: "3281250000",
    "Ecosystem Development": "3789062500",
    Foundation: "1721875000",
  },
  {
    Investors: "2812500000",
    Team: "3375000000",
    "Ecosystem Development": "3843750000",
    Foundation: "1762500000",
  },
  {
    Investors: "2890625000",
    Team: "3468750000",
    "Ecosystem Development": "3898437500",
    Foundation: "1803125000",
  },
  {
    Investors: "2968750000",
    Team: "3562500000",
    "Ecosystem Development": "3953125000",
    Foundation: "1843750000",
  },
  {
    Investors: "3046875000",
    Team: "3656250000",
    "Ecosystem Development": "4007812500",
    Foundation: "1884375000",
  },
  {
    Investors: "3125000000",
    Team: "3750000000",
    "Ecosystem Development": "4062500000",
    Foundation: "1925000000",
  },
  {
    Investors: "3203125000",
    Team: "3843750000",
    "Ecosystem Development": "4117187500",
    Foundation: "1965625000",
  },
  {
    Investors: "3281250000",
    Team: "3937500000",
    "Ecosystem Development": "4171875000",
    Foundation: "2006250000",
  },
  {
    Investors: "3359375000",
    Team: "4031250000",
    "Ecosystem Development": "4226562500",
    Foundation: "2046875000",
  },
  {
    Investors: "3437500000",
    Team: "4125000000",
    "Ecosystem Development": "4281250000",
    Foundation: "2087500000",
  },
  {
    Investors: "3515625000",
    Team: "4218750000",
    "Ecosystem Development": "4335937500",
    Foundation: "2128125000",
  },
  {
    Investors: "3593750000",
    Team: "4312500000",
    "Ecosystem Development": "4390625000",
    Foundation: "2168750000",
  },
  {
    Investors: "3671875000",
    Team: "4406250000",
    "Ecosystem Development": "4445312500",
    Foundation: "2209375000",
  },
  {
    Investors: "3750000000",
    Team: "4500000000",
    "Ecosystem Development": "4500000000",
    Foundation: "2250000000",
  },
];

const s1_immediate = 106768233 + 321615883;
const s1_vested = 321615885;
const s1_vesting_months = 6;
const s1_month_start = 1; // April 2024

const s2_immediate = 407365421 + 171317290;
const s2_vested = 171317288;
const s2_vesting_months = 6;
const s2_month_start = 6; // September 2024

const s3_immediate = 437500000; // Assumed based on 83.3% immediate
const s3_vested = 87500000; // Assumed 16.7% vested
const s3_vesting_months = 6;
const s3_month_start = 14; // May 2025

// Function to distribute vested exactly
function distributeVested(vested: number, months: number): number[] {
  const perMonth = Math.floor(vested / months);
  const remainder = vested % months;
  const monthly = new Array(months).fill(perMonth);
  for (let k = 0; k < remainder; k++) {
    monthly[k] += 1;
  }
  return monthly;
}

const s1_vested_monthly = distributeVested(s1_vested, s1_vesting_months);
const s2_vested_monthly = distributeVested(s2_vested, s2_vesting_months);
const s3_vested_monthly = distributeVested(s3_vested, s3_vesting_months);

// Monthly added for airdrops
const s1_monthly_added = new Array(data.length).fill(0);
s1_monthly_added[s1_month_start] += s1_immediate;
for (let k = 0; k < s1_vesting_months; k++) {
  if (s1_month_start + k < data.length) {
    s1_monthly_added[s1_month_start + k] += s1_vested_monthly[k];
  }
}

const s2_monthly_added = new Array(data.length).fill(0);
s2_monthly_added[s2_month_start] += s2_immediate;
for (let k = 0; k < s2_vesting_months; k++) {
  if (s2_month_start + k < data.length) {
    s2_monthly_added[s2_month_start + k] += s2_vested_monthly[k];
  }
}

const s3_monthly_added = new Array(data.length).fill(0);
s3_monthly_added[s3_month_start] += s3_immediate;
for (let k = 0; k < s3_vesting_months; k++) {
  if (s3_month_start + k < data.length) {
    s3_monthly_added[s3_month_start + k] += s3_vested_monthly[k];
  }
}

const original_eco_diffs: number[] = data.map((d, i) => {
  const current = parseInt(d["Ecosystem Development"]);
  const prev = i === 0 ? 0 : parseInt(data[i - 1]["Ecosystem Development"]);
  return current - prev;
});

const adjusted_eco_diffs: number[] = [];
let carry = 0;
for (let i = 0; i < original_eco_diffs.length; i++) {
  let subtract_this_month = s1_monthly_added[i] + s2_monthly_added[i] + s3_monthly_added[i] + carry;
  let adjusted = original_eco_diffs[i] - subtract_this_month;
  if (adjusted < 0) {
    carry = -adjusted;
    adjusted = 0;
  } else {
    carry = 0;
  }
  adjusted_eco_diffs.push(adjusted);
}

let eco_cum = 0;
data.forEach((d, i) => {
  eco_cum += adjusted_eco_diffs[i];
  d["Ecosystem Development"] = eco_cum.toString();
});

// Set airdrop cumulatives
let s1_current = 0;
data.forEach((d, i) => {
  s1_current += s1_monthly_added[i];
  d["Airdrop S1"] = s1_current.toString();
});

let s2_current = 0;
data.forEach((d, i) => {
  s2_current += s2_monthly_added[i];
  d["Airdrop S2"] = s2_current.toString();
});

let s3_current = 0;
data.forEach((d, i) => {
  s3_current += s3_monthly_added[i];
  d["Airdrop S3"] = s3_current.toString();
});

const ena: Protocol = {
  meta: {
    token: `${chain}:${token}`,
    notes: [`Data shown is from a CSV supplied by Ethena on 20 May 2024.`,
      `Airdrops (S1, S2, S3) are modeled as separate sections subtracted from Ecosystem Development to reflect distributions as allocated/owned tokens per oFDV principles, ensuring max supply remains exactly 15B ENA.`,
      `S1 (Shard Campaign): 750M ENA total. Immediate: ~428M (non-top wallets 100% + top 2000 immediate 50%). Vested: ~322M (top 2000 50% over 6 months). Assumptions: Exact splits based on historical claims; vesting linearized monthly for simplicity (official is weekly).`,
      `S2 (Sats Campaign): 750M ENA total. Immediate: ~578M (non-largest wallets 100% + largest 2000 immediate 50%). Vested: ~171M (largest 2000 50% over 6 months). Assumptions: As above; start month adjusted to match CSV bumps.`,
      `S3: 525M ENA total (3.5% supply). Immediate: ~438M (assumed 83.3%: top 2000 immediate 2/3 + non-top 100%). Vested: ~88M (assumed 16.7%: top 2000 1/3 over 6 months, with top ~50% of total allocation). Assumptions: Proportions estimated from announcement (top vesting 1/3, no exact top/non-top split public); monthly linear (official weekly). Update if precise data available.`,
      `Top 2000 wallet vesting: No public list of exact wallets or per-wallet amounts, so modeled as aggregate linear unlocks.`,
      `General: Rounding applied for integer totals; minor discrepancies (~1-5M) may occur from vesting distribution.`,
    ],
    sources: [
      "https://mirror.xyz/0xF99d0E4E3435cc9C9868D1C6274DfaB3e2721341/uCBp9VeuLWs-ul1b6AOUAoMg5HBB_iizMIi-11N6nT8",
    ],
    protocolIds: ["4133"],
  },
  categories: {
    noncirculating: ["Foundation","Ecosystem Development"],
    privateSale: ["Investors"],
    insiders: ["Team"],
    airdrop: ["Airdrop S1", "Airdrop S2", "Airdrop S3"],
  },
};

Object.keys(data[0]).map((key) => {
  ena[key] = data.map((d: any, i: number) => ({
    start: start + periodToSeconds.months(i),
    type: "linear",
    end: start + periodToSeconds.months(i + 1),
    amount: parseInt(d[key]) - (i == 0 ? 0 : parseInt(data[i - 1][key])),
  }));
});

export default ena;