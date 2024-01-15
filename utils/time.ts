import dayjs from "dayjs";
import { LinearAdapterResult } from "../types/adapters";

export function readableToSeconds(readableDate: string): number {
  const date = new Date(readableDate);
  return Math.floor(date.getTime() / 1000);
}
export function unixTimestampNow() {
  return Math.floor(new Date().getTime() / 1000);
}
export function secondsToReadableDate(
  datetime: number | string,
  format: string = "DD MM YYYY",
  locale: string = "en-US",
): string {
  if (typeof datetime == "string") datetime = parseInt(datetime);
  if (datetime < 10 ** 10) datetime *= 1000;
  return dayjs(datetime).locale(locale).format(format);
}
export function secondsDifference(end: Date, start = new Date()): number {
  const date1 = dayjs(end).startOf("day");
  const date2 = dayjs(start).startOf("day");
  return date1.diff(date2, "second");
}
export const periodToSeconds = {
  year: 31556926,
  month: 2629743,
  week: 604800,
  day: 86400,
  hour: 3600,
  minute: 60,
  months: (months: number) => periodToSeconds.month * months,
  weeks: (weeks: number) => periodToSeconds.week * weeks,
  years: (years: number) => periodToSeconds.year * years,
  days: (days: number) => periodToSeconds.day * days,
};
export function stringToTimestamp(
  inputDate: string,
  format: string = "YYYY/MM/DD",
): number {
  const year = parseDateString(inputDate, format.toLowerCase(), "y");
  const month = parseDateString(inputDate, format.toLowerCase(), "m");
  const day = parseDateString(inputDate, format.toLowerCase(), "d");
  const seconds = readableToSeconds(`${year}-${month}-${day}T00:00:00`);
  if (isNaN(seconds))
    throw new Error(`${inputDate} is not in the format ${format}`);
  return seconds;
}
function parseDateString(input: string, format: string, key: string) {
  const result = input.substring(
    format.indexOf(key),
    format.lastIndexOf(key) + 1,
  );
  if (["d", "m"].includes(key) && result.length == 1) return `0${result}`;
  if (key == "y" && result.length == 2) return `20${result}`;
  return result;
}
export function normalizeTime(
  time: string | number,
  format: string | undefined,
): number {
  if (typeof time != "string") return time;
  if (time.search(/([/-])/g) == -1 && time.length == 10) return parseInt(time);
  const dateFormat = format ?? "YYYY/MM/DD";
  return stringToTimestamp(time, dateFormat);
}
export const ratePerPeriod = (
  r: LinearAdapterResult,
  precision: number,
  period: number = periodToSeconds.week,
): number =>
  Number(((r.amount * period) / (r.end - r.start)).toPrecision(precision));

export function secondsToReadableDifference(seconds: number) {
  if (seconds > periodToSeconds.month * 2) {
    return `${seconds / periodToSeconds.month} months`;
  } else if (seconds > periodToSeconds.week * 2) {
    return `${seconds / periodToSeconds.week} weeks`;
  } else {
    return `${seconds / periodToSeconds.day} days`;
  }
}
export const isFuture = (timestamp: number) => {
  return timestamp * 1000 > Date.now();
};
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
