import fetch from "node-fetch";
import { Protocol } from "../../types/adapters";
import { AdapterResult } from "../../types/adapters";
import { stringToTimestamp } from "../../utils/time";
import { CliffAdapterResult } from "../../types/adapters";
import { periodToSeconds } from "../../utils/time";
let res: any;

type Vesting = {
  tokenName: string;
  totalCount: number;
};
type VestingMode = {
  mode: "linear" | "epoch";
  cliff?: number;
  dailyRewards?: number;
  lastDay?: number;
  tgeUnlock?: number;
  totalVestedLinear?: number;
};
type DaoMakerApiRes = {
  coingecko_api_id: string;
  link: string;
  title: string;
  vestings: Vesting[];
  vestingsMode: VestingMode[];
  tge: string;
};

async function vestings(): Promise<DaoMakerApiRes[]> {
  if (!res)
    return fetch(`https://api.daomaker.com/defillama/company/vestings`).then(
      (r) => r.json(),
    );
  return res;
}
function processEpochsData(
  vestings: Vesting,
  tge: number,
): CliffAdapterResult[] {
  let workingQty: number = 0;
  const section: CliffAdapterResult[] = [];

  Object.entries(vestings).map(([v, q]) => {
    const epoch: number = Number(v);
    const amount = Number(q);
    if (isNaN(epoch) || q == 0) return;

    section.push({
      type: "cliff",
      start: tge + epoch * periodToSeconds.day,
      amount,
    });

    workingQty += amount;
  });

  section.push({
    type: "cliff",
    start: section[section.length - 1].start + periodToSeconds.week,
    amount: 0,
  });

  if (workingQty < vestings.totalCount * 0.99)
    throw new Error(
      `The accumulated unlocks for ${vestings.tokenName} does not match the total count.`,
    );

  return section;
}
function processLinearData(
  vestings: Vesting,
  tge: number,
  mode: VestingMode,
): AdapterResult[] {
  const section: AdapterResult[] = [];

  if (!mode.cliff || !mode.lastDay || !mode.totalVestedLinear)
    throw new Error(
      `unable to parse ${vestings.tokenName} because expected linear props are missing`,
    );
  if (mode.tgeUnlock)
    section.push({ type: "cliff", start: tge, amount: mode.tgeUnlock });

  section.push({
    type: "linear",
    start: tge + periodToSeconds.day * mode.cliff,
    end: tge + periodToSeconds.day * mode.lastDay,
    amount: mode.totalVestedLinear,
  });

  return section;
}
export async function daoMakerApi(title: string): Promise<Protocol> {
  const res: DaoMakerApiRes[] = await vestings();
  const api: DaoMakerApiRes | undefined = res.find(
    (r: DaoMakerApiRes) => r.title.toLowerCase() == title.toLowerCase(),
  );
  if (!api) throw new Error(`unable to find project of title ${title}`);

  const exp: Protocol = {
    meta: {
      token: `coingecko:${api.coingecko_api_id}`,
      sources: [api.link],
      notes: [`Data used in this analysis has been supplied by DAO Maker`],
      protocolIds: [], // need
    },
    categories: {}, // need
  };

  const tge: number = stringToTimestamp(api.tge);
  api.vestings
    // .filter(
    //   (v: Vesting) =>
    //     v.tokenName == "DAO Managed Foundation" ||
    //     v.tokenName == "Customer incentives",
    // )
    .map((v: Vesting, i: number) => {
      const mode = api.vestingsMode[i];
      let sectionData: AdapterResult[];

      switch (mode.mode) {
        case "epoch":
          sectionData = processEpochsData(v, tge);
          break;
        case "linear":
          sectionData = processLinearData(v, tge, mode);
          break;
        default:
          throw new Error(`unknown vesting mode`);
      }

      exp[v.tokenName] = sectionData;
    });

  return exp;
}
