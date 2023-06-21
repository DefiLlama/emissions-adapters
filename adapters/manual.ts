import {
  StepAdapterResult,
  CliffAdapterResult,
  LinearAdapterResult,
} from "../types/adapters";
import { normalizeTime } from "../utils/time";

export const manualStep = (
  start: number | string,
  stepDuration: number | string,
  steps: number,
  amount: number,
  dateFormat: string | undefined = undefined,
): StepAdapterResult => ({
  type: "step",
  start: normalizeTime(start, dateFormat),
  stepDuration: normalizeTime(stepDuration, dateFormat),
  steps,
  amount,
});

export const manualCliff = (
  start: number | string,
  amount: number,
  dateFormat: string | undefined = undefined,
): CliffAdapterResult => ({
  type: "cliff",
  start: normalizeTime(start, dateFormat),
  amount,
});

export const manualLinear = (
  start: number | string,
  end: number | string,
  amount: number,
  dateFormat: string | undefined = undefined,
): LinearAdapterResult => ({
  type: "linear",
  start: normalizeTime(start, dateFormat),
  end: normalizeTime(end, dateFormat),
  amount,
});
export const manualLog = (
  start: number | string,
  end: number | string,
  amount: number,
  periodLength: number,
  percentDecreasePerPeriod: number,
  converging: boolean = true,
  percentInFirstPeriod: number | undefined = undefined,
  dateFormat: string | undefined = undefined,
): LinearAdapterResult[] => {
  let sections: LinearAdapterResult[] = [];
  let thisStart: number = normalizeTime(start, dateFormat);
  const periods: number =
    (normalizeTime(end, dateFormat) - thisStart) / periodLength;
  let workingQty: number = 100;
  let sum: number = 0;

  for (let i = 1; i < periods; i++) {
    const thisQty: number =
      percentInFirstPeriod && i == 1
        ? amount * (percentInFirstPeriod / 100)
        : workingQty * (1 - percentDecreasePerPeriod / 100);
    sections.push(manualLinear(thisStart, thisStart + periodLength, thisQty));

    sum += thisQty;
    workingQty = thisQty;
    thisStart += periodLength;
  }

  if (converging) {
    const factor: number = amount / sum;
    sections = sections.map((s: LinearAdapterResult) => ({
      type: s.type,
      start: s.start,
      end: s.end,
      amount: (s.amount *= factor),
    }));
  }

  return sections;
};
