import fetch from "node-fetch";
import { sleep } from "./time";
const burl: string = "https://open-api.coinglass.com";

type Res = {
  openInterest: number;
  avgFundingRateByVol: number;
  exchangeName: string;
};

type FuturesData = {
  openInterest: number;
  fundingRate: number;
  success: boolean;
  ratelimited?: boolean;
};

export async function createFuturesData(
  symbol: string,
): Promise<FuturesData | undefined> {
  if (!process.env.COINGLASS_KEY) {
    console.error(`no coinglass key supplied`);
    return undefined;
  }
  let data: FuturesData | undefined = await fetchCoinGlass(symbol);
  if (data.ratelimited) {
    sleep(60000);
    data = await fetchCoinGlass(symbol);
  }
  if (!data.success) return undefined;

  return data;
}

async function fetchCoinGlass(symbol: string): Promise<FuturesData> {
  const res = await fetch(`${burl}/public/v2/open_interest?symbol=${symbol}`, {
    headers: {
      coinglassSecret: process.env.COINGLASS_KEY ?? "",
    },
  }).then((r) => r.json());

  if (!res.success && res.code == "50001")
    return {
      openInterest: 0,
      fundingRate: 0,
      success: false,
      ratelimited: true,
    };

  if (res.code != "0" || res.data == null)
    return {
      openInterest: 0,
      fundingRate: 0,
      success: false,
    };

  const data = res.data.find((e: Res) => e.exchangeName == "All");

  return {
    openInterest: data.openInterest,
    fundingRate: data.avgFundingRateByVol,
    success: true,
  };
}
