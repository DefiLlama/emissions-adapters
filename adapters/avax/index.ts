import { CliffAdapterResult } from "../../types/adapters";
import jsob from "./schedule.json";

type Unlock = { amount: number; locktime: number };
type Allocation = {
  initialAmount: number;
  unlockSchedule: Unlock[];
};

export function time(): CliffAdapterResult[] {
  const data: any = jsob;
  const sections: CliffAdapterResult[] = [];

  data.allocations.map((a: Allocation) => {
    if (a.initialAmount)
      sections.push({
        type: "cliff",
        start: data.startTime,
        amount: a.initialAmount / 10 ** 9,
      });

    a.unlockSchedule.map((u: Unlock) => {
      sections.push({
        type: "cliff",
        start: u.locktime,
        amount: u.amount / 10 ** 9,
      });
    });
  });

  return sections;
}
