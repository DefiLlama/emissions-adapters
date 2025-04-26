import fetch from "node-fetch";
import { LinearAdapterResult } from "../../types/adapters";
import { periodToSeconds } from "../../utils/time";
import etherscan from "./etherscan.json";
import uncleData from "./uncle.json";

export const inflation = async (): Promise<LinearAdapterResult[]> => {
  const csvAmount = "120071885.806088302627129454";
  const sections: any[] = etherscan.data;
  const res = await (
    await fetch(`https://ultrasound.money/api/v2/fees/supply-over-time`)
  ).json();

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

export const uncle = async (): Promise<LinearAdapterResult[]> => {
  const rawData: any[] = uncleData;
  const linearSections: LinearAdapterResult[] = [];

  const sortedData = [...rawData].sort((a, b) => a.timestamp - b.timestamp);

  for (let i = 0; i < sortedData.length - 1; i++) {
    const current = sortedData[i];
    
    linearSections.push({
      type: "linear",
      amount: Number(current.uncles_reward),
      start: current.timestamp,
      end: sortedData[i + 1].timestamp
    });
  }

  const lastEntry = sortedData[sortedData.length - 1];
  linearSections.push({
    type: "linear",
    amount: Number(lastEntry.uncles_reward),
    start: lastEntry.timestamp,
    end: lastEntry.timestamp + periodToSeconds.day
  });

  return linearSections;
};
