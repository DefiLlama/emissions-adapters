import dayjs from "dayjs";
import { AdapterResult } from "../types/adapters";

export function readableToSeconds(readableDate: string): number {
  const date = new Date(readableDate);
  return Math.floor(date.getTime() / 1000);
}
export function secondsToReadable(
  datetime: number,
  format: string = "DD MM YYYY",
  locale: string = "en-US",
): string {
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
};
export function stringToTimestamp(
  inputDate: string,
  format: string = "YYYY/MM/DD",
): number {
  const year = parseDateString(inputDate, format.toLowerCase(), "y");
  const month = parseDateString(inputDate, format.toLowerCase(), "m");
  const day = parseDateString(inputDate, format.toLowerCase(), "d");
  const seconds = readableToSeconds(`${year}-${month}-${day}T00:00:00`);
  if (isNaN(seconds)) throw new Error(`${inputDate} is not in the format ${format}`)
  return seconds
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
  format: string | undefined
): number {
  if (typeof time != "string") return time;
  if (time.search(/([/-])/g) == -1 && time.length == 10) return parseInt(time);
  const dateFormat = format ?? "YYYY/MM/DD";
  return stringToTimestamp(time, dateFormat);
}