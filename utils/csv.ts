import * as fs from "fs";
import { resolve } from "path";
import csvParser from "csv-parser";

export const parseCSVToJSON = async (relative: string): Promise<any[]> => {
  const absolute = resolve(relative);

  return await new Promise((resolve, reject) => {
    const results: any[] = [];

    fs.createReadStream(absolute)
      .pipe(csvParser())
      .on("data", (data: any) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error: any) => reject(error));
  });
};
