import { daoSchedule, latestDao } from "./balance";

export const dodoSchedule = () =>
  daoSchedule(
    1000000000 * 0.6,
    ["0x4447183c50e82a8b0141718c405381a3b1bad634"],
    "0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd",
    "ethereum",
    "dodo",
    1602457200,
  );
export const dodoLatest = () => latestDao("dodo", 1602457200);
