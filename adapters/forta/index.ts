import { daoSchedule, latestDao } from "../balance";
import contracts from "./contracts";

export const unallocated = () =>
  Promise.all(
    Object.keys(contracts).map((k: any) =>
      daoSchedule(
        contracts[k].owners,
        contracts[k].token,
        k,
        "forta",
        1651356000,
      ),
    ),
  );
export const latest = () => latestDao("forta", 1651356000);
