import { Protocol } from "../../types/adapters";
import { AdapterResult } from "../../types/adapters";
import { stringToTimestamp } from "../../utils/time";
import { CliffAdapterResult } from "../../types/adapters";
import { periodToSeconds } from "../../utils/time";

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
export type DaoMakerApiRes = {
  coingecko_api_id: string;
  link: string;
  title: string;
  vestings: Vesting[];
  vestingsMode: VestingMode[];
  tge: string;
};

function processEpochsData(
  vestings: Vesting,
  tge: number,
  title: string,
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
      `The accumulated unlocks for ${vestings.tokenName} in ${title} does not match the total count.`,
    );

  return section;
}
function processLinearData(
  vestings: Vesting,
  tge: number,
  title: string,
  mode: VestingMode,
): AdapterResult[] {
  const section: AdapterResult[] = [];

  if (!mode.cliff || !mode.lastDay || !mode.totalVestedLinear)
    throw new Error(
      `unable to parse ${vestings.tokenName} in ${title} because expected linear props are missing`,
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
export default async function daoMaker(api: DaoMakerApiRes): Promise<Protocol> {
  const protocol: Protocol = {
    meta: {
      token: `coingecko:${api.coingecko_api_id}`,
      sources: [api.link],
      notes: [`Data used in this analysis has been supplied by DAO Maker`],
      protocolIds: [],
    },
    categories: {}, // need
  };

  const tge: number = stringToTimestamp(api.tge);
  api.vestings.map((v: Vesting, i: number) => {
    const mode = api.vestingsMode[i];
    let sectionData: AdapterResult[];

    switch (mode.mode) {
      case "epoch":
        sectionData = processEpochsData(v, tge, api.title);
        break;
      case "linear":
        sectionData = processLinearData(v, tge, api.title, mode);
        break;
      default:
        throw new Error(`unknown vesting mode`);
    }

    protocol[v.tokenName] = sectionData;
  });

  return protocol;
}
