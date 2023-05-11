import { daoSchedule } from "./forta";
import contracts from "./contracts";
export const unallocated = () =>
  Promise.all(
    Object.keys(contracts).map((k: any) =>
      daoSchedule(
        391000000,
        contracts[k].owners,
        contracts[k].token,
        k,
        "forta",
        1651356000,
      ),
    ),
  );
