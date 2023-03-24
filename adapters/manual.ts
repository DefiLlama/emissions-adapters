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
