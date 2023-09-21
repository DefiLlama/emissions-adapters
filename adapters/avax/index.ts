import { CliffAdapterResult } from "../../types/adapters";
import jsob from "./schedule.json";

type Unlock = { amount: number; locktime: number };
type Allocation = {
  initialAmount: number;
  unlockSchedule: Unlock[];
};

export function time(): Object {
  const data: any = jsob;
  const res: { [label: string]: CliffAdapterResult[] } = {};

  data.allocations.map((a: Allocation, i: number) => {
    const sections: CliffAdapterResult[] = [];

    if (a.initialAmount)
      sections.push({
        type: "cliff",
        start: data.startTime,
        amount: a.initialAmount,
      });

    a.unlockSchedule.map((u: Unlock) => {
      sections.push({ type: "cliff", start: u.locktime, amount: u.amount });
    });

    if (sections.length == 0) return;

    res[`Unknown ${i}`] = sections;
  });

  return res;
}
