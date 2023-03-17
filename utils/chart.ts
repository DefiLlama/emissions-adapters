import fs from "fs";
import { resolve } from "path";
import dayjs from "dayjs";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { ChartSection, Dataset } from "../types/adapters";
import { sendToImageHost } from "./comment";

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 1000,
  height: 500,
  backgroundColour: "white",
});
const hexColors: { [name: string]: string } = {
  green: "#008000",
  blue: "#0000FF",
  cyan: "#00FFFF",
  indigo: "#4B0082",
  gray: "#696969",
  maroon: "#800000",
  purple: "#800080",
};
export async function draw(
  configuration: any,
  toBase64: boolean,
): Promise<Buffer | string> {
  if (toBase64)
    return await chartJSNodeCanvas.renderToDataURL(configuration, `image/png`);
  return await chartJSNodeCanvas.renderToBuffer(configuration, `image/png`);
}
function buildOptionsObject(data: ChartSection[]): Object {
  const labels: string[] = data[0].data.timestamps.map((t: number) =>
    stringifyDate(t * 1e3, "DD/MM/YYYY"),
  );
  const sections: string[] = [
    ...new Set(data.map((d: ChartSection) => d.section)),
  ];

  const datasets: Dataset[] = data.map((d: ChartSection) => ({
    label: d.section,
    data: d.data.unlocked,
    borderColor: Object.values(hexColors)[sections.indexOf(d.section)],
    backgroundColor: Object.values(hexColors)[sections.indexOf(d.section)],
    fill: true,
  }));

  return {
    animation: {
      duration: 750,
    },
    responsive: false,
    type: "line" as any,
    data: {
      labels,
      datasets,
    },
    options: {
      scales: {
        y: {
          stacked: true,
          text: "Supply",
        },
        x: {
          text: "Date",
        },
      },
      layout: {
        autoPadding: true,
      },
      elements: {
        point: {
          radius: 0,
        },
      },
    },
  };
}
export async function getChartPng(
  data: ChartSection[],
  isCI: boolean,
): Promise<void> {
  const path: string = resolve(__dirname);
  const options: Object = buildOptionsObject(data);
  let image: Buffer | string = await draw(options, isCI);
  let saveLocation = `${path}/result.png`;
  if (typeof image == "string") {
    image = await sendToImageHost(image);
    saveLocation = `result.txt`;
  }
  fs.writeFile(saveLocation, image, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log(`The file was saved at ${saveLocation}!`);
  });
}
function stringifyDate(
  datetime: number,
  format: string,
  locale = "en-US",
): string {
  return dayjs(datetime).locale(locale).format(format);
}
