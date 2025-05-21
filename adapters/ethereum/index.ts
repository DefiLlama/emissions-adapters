import fetch from "node-fetch";
import { CliffAdapterResult, LinearAdapterResult } from "../../types/adapters";
import { periodToSeconds } from "../../utils/time";
import uncleData from "./uncle.json";

// export const inflation = async (): Promise<LinearAdapterResult[]> => {
//   const csvAmount = "120071885.806088302627129454";
//   const sections: any[] = etherscan.data;
//   const res = await (
//     await fetch(`https://ultrasound.money/api/v2/fees/supply-over-time`)
//   ).json();

//   const start = sections[sections.length - 1].end;
//   let end = Number(start) + periodToSeconds.day;

//   res.d1.map((t: any) => {
//     const unix = Math.floor(new Date(t.timestamp).getTime() / 1000);
//     if (unix < end) return;
//     const amount = Number(t.supply) - Number(csvAmount);
//     sections.push({
//       type: "linear",
//       amount,
//       start,
//       end,
//     });
//     end += periodToSeconds.day;
//   });

//   return sections;
// };

export const uncle = async (): Promise<CliffAdapterResult[]> => {
  const rawData = uncleData;
  const cliffSections: CliffAdapterResult[] = [];

  const { startTime, rewards } = rawData;

  for (let i = 0; i < rewards.length; i++) {
    const start = startTime + i * 86400;

    cliffSections.push({
      type: "cliff",
      amount: Number(rewards[i]),
      start: start,
    });
  }

  return cliffSections;
};