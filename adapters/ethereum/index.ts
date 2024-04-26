import fetch from "node-fetch";
import { LinearAdapterResult } from "../../types/adapters";
import { periodToSeconds } from "../../utils/time";
import { parseCSVToJSON } from "../../utils/csv";

const processCsvData = async (): Promise<{
  sections: LinearAdapterResult[];
  csvAmount: number;
}> => {
  const data = await parseCSVToJSON("./defi/emissions-adapters/adapters/ethereum/etherscan.csv");
  const sections: LinearAdapterResult[] = [];

  data.map((t: any, i: number) => {
    if (i == 0) {
      sections.push({
        type: "linear",
        start: t.UnixTimeStamp - periodToSeconds.day,
        end: Number(t.UnixTimeStamp),
        amount: t.Value - 72e6,
      });
      return;
    }

    const amount = t.Value - data[i - 1].Value;
    sections.push({
      type: "linear",
      start: Number(data[i - 1].UnixTimeStamp),
      end: Number(t.UnixTimeStamp),
      amount,
    });
  });

  const csvAmount = data[data.length - 1].Value;
  return { sections, csvAmount };
};

export const inflation = async (): Promise<LinearAdapterResult[]> => {
  const { sections, csvAmount } = await processCsvData();
  const res = await (await fetch(`https://ultrasound.money/api/v2/fees/supply-over-time`)).json();

  const start = sections[sections.length - 1].end;
  let end = Number(start) + periodToSeconds.day;

  res.d1.map((t: any) => {
    const unix = Math.floor(new Date(t.timestamp).getTime() / 1000);
    if (unix < end) return;
    const amount = Number(t.supply) - Number(csvAmount);
    sections.push({
      type: "linear",
      amount,
      start,
      end,
    });
    end += periodToSeconds.day;
  });

  return sections;
};
