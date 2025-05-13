import { balance, latest as late } from "../balance";
import contracts from "./contracts";

export const unallocated = (backfill: boolean) =>
  Promise.all(
    Object.keys(contracts).map((k: any) =>
      balance(
        contracts[k].owners,
        contracts[k].token,
        k,
        "forta",
        contracts[k].timestamp,
        backfill,
      ),
    ),
  );
export const latest = (backfill: boolean) =>
  late("forta", 1651356000, backfill);
